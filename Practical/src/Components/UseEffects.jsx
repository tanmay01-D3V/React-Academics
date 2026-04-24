import {useState,useEffect} from "react";

const UseEffects = () => {
  const [users, setUser] = useState([]);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, []);
  return (
    <>
      <div className="text-left p-8 bg-purple-200">
        <h1 className="text-3xl font-bold mb-4 align-center text-center bg-purple-300">UseEffect Hook</h1>
        {users.map((user) => (
          <div key={user.id} className="mb-2 bg-white p-4 rounded shadow gap-2">
            <p className="text-lg font-semibold">{user.name}</p>
            <hr className="border-"></hr>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default UseEffects
