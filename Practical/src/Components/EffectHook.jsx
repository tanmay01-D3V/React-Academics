import React from "react";
import { useState, useEffect } from "react";

const EffectHook = () => {
  const [users, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://randomuser.me/api/");
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
    <div>
      {loading ? (
        <p className="text-4xl align-center justify-center text-center">
          Loading...
        </p>
      ) : (
        users.map((user, index) => (
          <div key={index}>
            <p className="bg-violet-200 text-4xl text-center p-4">
              {user.name.first} {user.name.last}
            </p>

            <div className="flex items-center justify-center gap-6 my-5">
              <button
                onClick={() => handleAction("pass")}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:scale-110 transition"
              >
                Pass
              </button>

              <img
                className="w-164 h-164 object-cover"
                src={user.picture.medium}
                alt="user"
              />

              <button
                onClick={() => handleAction("smash")}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:scale-110 transition"
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
