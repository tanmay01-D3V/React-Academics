import { useState, useEffect } from "react";

const UseEffects = () => {
  const [users, setUser] = useState([]);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, []);
  return (
    <>
      <div className="text-left p-8 bg-purple-200 dark:bg-slate-800 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-4 align-center text-center bg-purple-300 dark:bg-slate-700 p-2 rounded dark:text-white">UseEffect Hook</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user.id} className="mb-2 bg-white dark:bg-slate-700 p-4 rounded shadow-md border border-transparent dark:border-slate-600 transition-colors duration-300">
              <p className="text-lg font-semibold dark:text-white">{user.name}</p>
              <hr className="my-2 border-slate-200 dark:border-slate-600"></hr>
              <p className="text-gray-600 dark:text-slate-300">{user.email}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UseEffects
