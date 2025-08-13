import { useUsers } from './hooks/useUsers';

function App() {
  const { data: users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.first} {user.last}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
