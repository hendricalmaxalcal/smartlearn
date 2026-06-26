import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── COURSES ───────────────────────────────────────────────

export const getCourses = async (filters = {}) => {
  const constraints = [where('is_published', '==', true)]
  if (filters.form_level) constraints.push(where('form_level', '==', filters.form_level))
  if (filters.stream) constraints.push(where('stream', '==', filters.stream))
  const snapshot = await getDocs(query(collection(db, 'courses'), ...constraints, orderBy('created_at', 'desc')))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getCourseBySlug = async (slug) => {
  const snapshot = await getDocs(
    query(collection(db, 'courses'), where('slug', '==', slug))
  )
  if (snapshot.empty) return null
  const courseDoc = snapshot.docs[0]
  const course = { id: courseDoc.id, ...courseDoc.data() }

  const chaptersSnapshot = await getDocs(
    query(collection(db, 'chapters'), where('course_id', '==', course.id), orderBy('order_index'))
  )
  course.chapters = await Promise.all(
    chaptersSnapshot.docs.map(async (ch) => {
      const chapter = { id: ch.id, ...ch.data() }
      const resourcesSnapshot = await getDocs(
        query(collection(db, 'resources'), where('chapter_id', '==', ch.id), orderBy('order_index'))
      )
      chapter.resources = resourcesSnapshot.docs.map((r) => ({ id: r.id, ...r.data() }))
      return chapter
    })
  )
  return course
}

export const enrollInCourse = async (userId, courseId) => {
  await addDoc(collection(db, 'enrollments'), {
    user_id: userId,
    course_id: courseId,
    enrolled_at: serverTimestamp(),
  })
}

export const getMyCourses = async (userId) => {
  const snapshot = await getDocs(
    query(collection(db, 'enrollments'), where('user_id', '==', userId))
  )
  const courseIds = snapshot.docs.map((d) => d.data().course_id)
  if (!courseIds.length) return []
  const courses = await Promise.all(
    courseIds.map(async (id) => {
      const courseDoc = await getDoc(doc(db, 'courses', id))
      if (!courseDoc.exists()) return null
      return { id: courseDoc.id, ...courseDoc.data(), progress: 0 }
    })
  )
  return courses.filter(Boolean)
}

export const createCourse = async (teacherId, data) => {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
  const ref = await addDoc(collection(db, 'courses'), {
    ...data,
    slug,
    teacher_id: teacherId,
    enrollment_count: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return ref.id
}

export const updateCourse = async (courseId, data) => {
  await updateDoc(doc(db, 'courses', courseId), {
    ...data,
    updated_at: serverTimestamp(),
  })
}

export const deleteCourse = async (courseId) => {
  await deleteDoc(doc(db, 'courses', courseId))
}

// ─── POSTS ─────────────────────────────────────────────────

export const getPosts = async () => {
  const snapshot = await getDocs(
    query(collection(db, 'posts'), orderBy('created_at', 'desc'), limit(50))
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createPost = async (userId, userName, userStream, content) => {
  await addDoc(collection(db, 'posts'), {
    user_id: userId,
    author_name: userName,
    author_stream: userStream,
    content,
    likes_count: 0,
    comments_count: 0,
    liked_by: [],
    created_at: serverTimestamp(),
  })
}

export const likePost = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId)
  const postDoc = await getDoc(postRef)
  const likedBy = postDoc.data().liked_by || []
  if (likedBy.includes(userId)) {
    await updateDoc(postRef, {
      liked_by: arrayRemove(userId),
      likes_count: increment(-1),
    })
  } else {
    await updateDoc(postRef, {
      liked_by: arrayUnion(userId),
      likes_count: increment(1),
    })
  }
}

export const addComment = async (postId, userId, userName, content) => {
  await addDoc(collection(db, 'comments'), {
    post_id: postId,
    user_id: userId,
    author_name: userName,
    content,
    created_at: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', postId), {
    comments_count: increment(1),
  })
}

export const getComments = async (postId) => {
  const snapshot = await getDocs(
    query(collection(db, 'comments'), where('post_id', '==', postId), orderBy('created_at', 'asc'))
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── STUDY GROUPS ──────────────────────────────────────────

export const getGroups = async (tab, userId) => {
  let snapshot
  if (tab === 'my-groups') {
    snapshot = await getDocs(
      query(collection(db, 'study_groups'), where('member_ids', 'array-contains', userId))
    )
  } else {
    snapshot = await getDocs(
      query(collection(db, 'study_groups'), where('is_private', '==', false), orderBy('created_at', 'desc'), limit(20))
    )
  }
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createGroup = async (userId, userName, data) => {
  const ref = await addDoc(collection(db, 'study_groups'), {
    ...data,
    owner_id: userId,
    owner_name: userName,
    member_ids: [userId],
    created_at: serverTimestamp(),
  })
  return ref.id
}

export const joinGroup = async (groupId, userId) => {
  await updateDoc(doc(db, 'study_groups', groupId), {
    member_ids: arrayUnion(userId),
  })
}

export const leaveGroup = async (groupId, userId) => {
  await updateDoc(doc(db, 'study_groups', groupId), {
    member_ids: arrayRemove(userId),
  })
}

export const getGroup = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'study_groups', groupId))
  if (!groupDoc.exists()) return null
  return { id: groupDoc.id, ...groupDoc.data() }
}

// ─── GROUP MESSAGES ────────────────────────────────────────

export const getGroupMessages = async (groupId) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'group_messages'),
      where('group_id', '==', groupId),
      orderBy('sent_at', 'asc'),
      limit(100)
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const sendGroupMessage = async (groupId, userId, userName, content) => {
  await addDoc(collection(db, 'group_messages'), {
    group_id: groupId,
    sender_id: userId,
    sender_name: userName,
    content,
    sent_at: serverTimestamp(),
  })
}

// ─── EVENTS ────────────────────────────────────────────────

export const getEvents = async () => {
  const now = new Date()
  const snapshot = await getDocs(
    query(
      collection(db, 'events'),
      where('event_date', '>=', now),
      orderBy('event_date', 'asc'),
      limit(20)
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getAllEvents = async () => {
  const snapshot = await getDocs(
    query(collection(db, 'events'), orderBy('event_date', 'desc'))
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createEvent = async (userId, data) => {
  await addDoc(collection(db, 'events'), {
    ...data,
    organizer_id: userId,
    attendee_ids: [],
    created_at: serverTimestamp(),
  })
}

export const updateEvent = async (eventId, data) => {
  await updateDoc(doc(db, 'events', eventId), data)
}

export const deleteEvent = async (eventId) => {
  await deleteDoc(doc(db, 'events', eventId))
}

export const rsvpEvent = async (eventId, userId) => {
  await updateDoc(doc(db, 'events', eventId), {
    attendee_ids: arrayUnion(userId),
  })
}

// ─── TEACHER ───────────────────────────────────────────────

export const getTeacherCourses = async (teacherId) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'courses'),
      where('teacher_id', '==', teacherId),
      orderBy('created_at', 'desc')
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getTeacherStats = async (teacherId) => {
  const courses = await getTeacherCourses(teacherId)
  const courseIds = courses.map((c) => c.id)
  if (!courseIds.length) return { totalStudents: 0, totalCourses: 0 }
  let totalStudents = 0
  for (const courseId of courseIds) {
    const enrollments = await getDocs(
      query(collection(db, 'enrollments'), where('course_id', '==', courseId))
    )
    totalStudents += enrollments.size
  }
  return { totalStudents, totalCourses: courses.length }
}

// ─── DIRECT MESSAGES ───────────────────────────────────────

export const getConversations = async (userId) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'conversations'),
      where('participant_ids', 'array-contains', userId),
      orderBy('last_message_at', 'desc')
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getMessages = async (conversationId) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'direct_messages'),
      where('conversation_id', '==', conversationId),
      orderBy('sent_at', 'asc'),
      limit(100)
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const sendMessage = async (conversationId, senderId, senderName, content) => {
  await addDoc(collection(db, 'direct_messages'), {
    conversation_id: conversationId,
    sender_id: senderId,
    sender_name: senderName,
    content,
    sent_at: serverTimestamp(),
  })
  await updateDoc(doc(db, 'conversations', conversationId), {
    last_message: content.length > 50 ? content.substring(0, 50) + '...' : content,
    last_message_at: serverTimestamp(),
  })
}

export const createConversation = async (userId, userName, otherUserId, otherUserName) => {
  const existing = await getDocs(
    query(
      collection(db, 'conversations'),
      where('participant_ids', 'array-contains', userId)
    )
  )
  const existingConv = existing.docs.find((d) => {
    const ids = d.data().participant_ids || []
    return ids.includes(otherUserId)
  })
  if (existingConv) {
    return { id: existingConv.id, ...existingConv.data() }
  }
  const ref = await addDoc(collection(db, 'conversations'), {
    type: 'dm',
    participant_ids: [userId, otherUserId],
    participant_names: {
      [userId]: userName,
      [otherUserId]: otherUserName,
    },
    last_message: null,
    last_message_at: serverTimestamp(),
    created_at: serverTimestamp(),
  })
  const newDoc = await getDoc(doc(db, 'conversations', ref.id))
  return { id: ref.id, ...newDoc.data() }
}

export const getUsers = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return []
  const snapshot = await getDocs(
    query(
      collection(db, 'users'),
      where('full_name', '>=', searchTerm),
      where('full_name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── ADMIN ─────────────────────────────────────────────────

export const getAdminStats = async () => {
  const [students, teachers, courses, posts] = await Promise.all([
    getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
    getDocs(query(collection(db, 'users'), where('role', '==', 'teacher'))),
    getDocs(query(collection(db, 'courses'), where('is_published', '==', true))),
    getDocs(collection(db, 'posts')),
  ])
  return {
    totalStudents: students.size,
    totalTeachers: teachers.size,
    totalCourses:  courses.size,
    totalPosts:    posts.size,
  }
}

export const getAdminUsers = async (role) => {
  let q
  if (role && role !== 'all') {
    q = query(collection(db, 'users'), where('role', '==', role), orderBy('created_at', 'desc'))
  } else {
    q = query(collection(db, 'users'), orderBy('created_at', 'desc'))
  }
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateUserRole = async (userId, role) => {
  await updateDoc(doc(db, 'users', userId), { role })
}

export const deleteUserDoc = async (userId) => {
  await deleteDoc(doc(db, 'users', userId))
}

// ─── ANNOUNCEMENTS ─────────────────────────────────────────

export const getAnnouncements = async () => {
  const snapshot = await getDocs(
    query(collection(db, 'announcements'), orderBy('created_at', 'desc'), limit(20))
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createAnnouncement = async (userId, userName, data) => {
  await addDoc(collection(db, 'announcements'), {
    ...data,
    author_id: userId,
    author_name: userName,
    created_at: serverTimestamp(),
  })
}

export const deleteAnnouncement = async (id) => {
  await deleteDoc(doc(db, 'announcements', id))
}

// ─── RESOURCES ─────────────────────────────────────────────

export const getResources = async (chapterId) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'resources'),
      where('chapter_id', '==', chapterId),
      orderBy('order_index')
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createResource = async (data) => {
  const ref = await addDoc(collection(db, 'resources'), {
    ...data,
    created_at: serverTimestamp(),
  })
  return ref.id
}

export const updateResource = async (resourceId, data) => {
  await updateDoc(doc(db, 'resources', resourceId), data)
}

export const deleteResource = async (resourceId) => {
  await deleteDoc(doc(db, 'resources', resourceId))
}

// ─── CHAPTERS ──────────────────────────────────────────────

export const getChapters = async (courseId) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'chapters'),
      where('course_id', '==', courseId),
      orderBy('order_index')
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createChapter = async (courseId, title, orderIndex) => {
  const ref = await addDoc(collection(db, 'chapters'), {
    course_id: courseId,
    title,
    order_index: orderIndex,
    is_free_preview: false,
    created_at: serverTimestamp(),
  })
  return ref.id
}