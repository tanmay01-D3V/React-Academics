import React from "react";
import { useState, useEffect } from "react";

const EffectHook = () => {
  const [users, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real users from India using GitHub Search API
      // We pick a random page to get a different user each time
      const randomPage = Math.floor(Math.random() * 100) + 1;
      const response = await fetch(
        `https://api.github.com/search/users?q=location:india&page=${randomPage}&per_page=1`,
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        // Format the data to match your component's expectation
        setUser([
          {
            name: { first: item.login, last: "" },
            picture: { medium: item.avatar_url },
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleAction = async (e, type) => {
    e.preventDefault();
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

      setTimeout(() => {
        fetchData();
      }, 100);
    } catch (error) {
      alert("Something went wrong 😅");
    }
  };

  return (
    <div className="main dark:bg-slate-900 transition-colors duration-300">
      {loading ? (
        <div className="loading flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-xl dark:text-white">Loading...</p>
        </div>
      ) : (
        users.map((user, index) => (
          <div key={index} className="user_profile max-w-md mx-auto my-10 mb-10 overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-xl transition-colors duration-300">
            <p className="bg-violet-200 dark:bg-indigo-900 text-slate-800 dark:text-white text-3xl font-bold text-center p-6">
              {user.name.first} {user.name.last}
            </p>

            <div className="flex items-center justify-center gap-8 py-8 px-4">
              <button
                type="button"
                onClick={(e) => handleAction(e, "pass")}
                className="passbutton bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Pass
              </button>

              <div className="profileimage relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  className="relative w-40 h-40 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                  src={user.picture.medium}
                  alt="user"
                />
              </div>

              <button
                type="button"
                onClick={(e) => handleAction(e, "smash")}
                className="smashbutton bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
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
