// Conditional export: offline demo mode vs real API.
// Set VITE_OFFLINE=true (npm run dev:offline) to use the mock layer.
import * as real from './realEndpoints.js'
import * as mock from './mockEndpoints.js'

const apis = import.meta.env.VITE_OFFLINE === 'true' ? mock : real

export const authApi = apis.authApi
export const departmentApi = apis.departmentApi
export const courseApi = apis.courseApi
export const lecturerApi = apis.lecturerApi
export const studentApi = apis.studentApi
export const roomApi = apis.roomApi
export const buildingApi = apis.buildingApi
export const semesterApi = apis.semesterApi
export const timetableApi = apis.timetableApi
export const modificationApi = apis.modificationApi
