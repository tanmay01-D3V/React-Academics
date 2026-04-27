import React from "react";
import { useState, useEffect } from "react";

const EffectHook = () => {
  const [users, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://randomuser.me/api");
      const data = await response.json();
      setUser(data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleAction = async (type) => {
    try {
      const res = await fetch(
        "https://official-joke-api.appspot.com/random_joke",
      );
      const joke = await res.json();

      if (type === "pass") {
        alert(`😂 You passed!\n${joke.setup} - ${joke.punchline}`);
      } else {
        alert(`😏 Smash huh!\n${joke.setup} - ${joke.punchline}`);
      }

      fetchData();
    } catch (error) {
      alert("Something went wrong 😅");
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-900 transition-colors duration-300">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-xl dark:text-white">Loading...</p>
        </div>
      ) : (
        users.map((user, index) => (
          <div key={index} className="max-w-md mx-auto mb-10 overflow-hidden bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-xl transition-colors duration-300">
            <p className="bg-violet-200 dark:bg-indigo-900 text-slate-800 dark:text-white text-3xl font-bold text-center p-6">
              {user.name.first} {user.name.last}
            </p>

            <div className="flex items-center justify-center gap-8 py-8 px-4">
              <button
                onClick={() => handleAction("pass")}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Pass
              </button>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  className="relative w-40 h-40 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                  src={user.picture.medium}
                  alt="user"
                />
              </div>

              <button
                onClick={() => handleAction("smash")}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Smash
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EffectHook;
