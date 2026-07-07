import ProfileView from '../../components/ProfileView.jsx'
import { useAuth } from '../../hooks/useAuth.js'

export default function LecturerProfile() {
  const { user } = useAuth()

  return (
    <ProfileView
      name={user.name}
      role="lecturer"
      fields={[
        { label: 'Email', value: user.email },
        { label: 'Department', value: user.department || '—' },
        { label: 'Staff ID', value: user.staffId || '—' },
      ]}
    />
  )
}
