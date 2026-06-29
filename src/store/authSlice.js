import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ full_name, email, password, form_level, stream, role }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: full_name })
      await sendEmailVerification(user)

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        full_name,
        email,
        role: (role || 'student').toLowerCase(),
        form_level,
        stream,
        avatar_url: null,
        is_verified: false,
        created_at: serverTimestamp(),
      })

      await signOut(auth)

      return { needsVerification: true, email }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        return rejectWithValue('Email already registered')
      }
      return rejectWithValue(err.message)
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (!user.emailVerified) {
        await signOut(auth)
        return rejectWithValue(
          'Please verify your email before logging in. Check your inbox.'
        )
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        return rejectWithValue('User data not found')
      }

      const userData = userDoc.data()

      await updateDoc(doc(db, 'users', user.uid), {
        is_verified: true,
      })

      return {
        id: user.uid,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role || 'student',
        form_level: userData.form_level,
        stream: userData.stream,
        avatar_url: userData.avatar_url || null,
      }
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        return rejectWithValue('Invalid email or password')
      }
      return rejectWithValue(err.message)
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser
      if (!user) return rejectWithValue(null)

      if (!user.emailVerified) return rejectWithValue(null)

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) return rejectWithValue(null)

      const userData = userDoc.data()
      return {
        id: user.uid,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role || 'student',
        form_level: userData.form_level,
        stream: userData.stream,
        avatar_url: userData.avatar_url || null,
      }
    } catch {
      return rejectWithValue(null)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    initialized: false,
    needsVerification: false,
    verificationEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.needsVerification = false
      state.verificationEmail = null
      signOut(auth)
    },
    clearError(state) {
      state.error = null
    },
    setInitialized(state) {
      state.initialized = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.needsVerification) {
          state.needsVerification = true
          state.verificationEmail = action.payload.email
        } else {
          state.user = action.payload
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.initialized = true
      })
  },
})

export const { logout, clearError, setInitialized } = authSlice.actions
export default authSlice.reducer