import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ full_name, email, password, form_level, stream }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: full_name })

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        full_name,
        email,
        role: 'student',
        form_level,
        stream,
        avatar_url: null,
        is_verified: true,
        created_at: serverTimestamp(),
      })

      return {
        id: user.uid,
        full_name,
        email,
        role: 'student',
        form_level,
        stream,
        avatar_url: null,
      }
    } catch (err) {
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

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        return rejectWithValue('User data not found')
      }

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
  },
  reducers: {
    logout(state) {
      state.user = null
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
    const pending   = (state) => { state.loading = true; state.error = null }
    const fulfilled = (state, action) => { state.loading = false; state.user = action.payload }
    const rejected  = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected)
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