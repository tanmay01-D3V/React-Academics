import React, { useState, useEffect } from "react";

const EffectHook = () => {
  const [users, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://randomuser.me/api",
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const user = data.results[0];
        setUser([
          {
            name: { first: user.name.first, last: user.name.last },
            picture: { medium: user.picture.large },
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
    <div className="main flex justify-center items-center py-10 px-4 transition-colors duration-300">
      {loading ? (
        <div className="loading flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          <p className="mt-6 text-xl font-medium text-slate-500 dark:text-slate-400 animate-pulse">Finding a match...</p>
        </div>
      ) : (
        users.map((user, index) => (
          <div 
            key={index} 
            className="user_profile w-full max-w-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-700/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="relative px-6 pb-10">
              <div className="flex justify-center -mt-24 mb-6">
                <div className="profileimage relative p-1.5 bg-white dark:bg-slate-700 rounded-full shadow-2xl">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full blur-sm opacity-50"></div>
                  <img
                    className="relative w-40 h-40 rounded-full object-cover border-4 border-white dark:border-slate-800"
                    src={user.picture.medium}
                    alt="user"
                  />
                </div>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {user.name.first} {user.name.last}
                </h2>
              </div>

              <div className="flex items-center justify-between gap-6">
                <button
                  type="button"
                  onClick={(e) => handleAction(e, "pass")}
                  className="group relative flex-1"
                >
                  <div className="absolute -inset-0.5 bg-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-4 rounded-2xl font-black text-lg shadow-sm transition-all duration-300 active:scale-95">
                    PASS
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleAction(e, "smash")}
                  className="group relative flex-1"
                >
                  <div className="absolute -inset-0.5 bg-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative flex items-center justify-center bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all duration-300 active:scale-95 hover:shadow-emerald-500/25 hover:shadow-xl">
                    SMASH
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EffectHook;
