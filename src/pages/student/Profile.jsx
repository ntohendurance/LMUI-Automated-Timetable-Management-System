import ProfileView from '../../components/ProfileView.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { LEVEL_TO_LABEL } from '../../api/adapters.js'

export default function StudentProfile() {
  const { user } = useAuth()

  return (
    <ProfileView
      name={user.name}
      role="student"
      fields={[
        { label: 'Matricule Number', value: user.matricule || '—' },
        { label: 'Email', value: user.email },
        { label: 'Department', value: user.department || '—' },
        { label: 'Level', value: LEVEL_TO_LABEL[user.level] || user.level || '—' },
      ]}
    />
  )
}
