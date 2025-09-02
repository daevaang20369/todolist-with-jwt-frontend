"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api";
import { useRouter } from "next/navigation";
export default function Notes() {
  const [user, setUser] = useState({name:""});
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUserNotes = async (token) => {
    try {
      const response = await axios.get(`${api}/notes`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data.user.todos);
      return response.data.user;
    } catch (error) {
      throw error.response || error;
    }
  };

  const fetchNotesWithRefresh = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/");
      return;
    }
    try {
      const data = await fetchUserNotes(accessToken);
      setNotes(data.todos || []);
      setUser(data);
      console.log(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        try {
          const refreshRes = await axios.get(`${api}/refreshtoken`, {
            withCredentials: true,
          });
          const newAccessToken = refreshRes.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          const retryData = await fetchUserNotes(newAccessToken);
          setNotes(retryData.todos || []);
        } catch (refreshError) {
          localStorage.clear();
          router.push("/");
        }
      } else {
        setError("Failed to fetch notes");
      }
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${api}/createnotes`,
        { note: noteText },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await setNotes(response.data.todos);
      setNoteText("");
    } catch (err) {
      setError("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${api}/notes/delete/${id}`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      setError("Failed to delete note");
    }
  };
  const markdone = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(token);
      const res = await axios.post(
        `${api}/notes/update/${id}`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes(res.data.todos);
    } catch {
      setError("Failed to updating note");
    }
  };
  const handlelogout =async()=>{
    try {
      await axios.get(
        `${api}/logout`,
      );
    } catch (err) {
      console.error("Logout failed:", err);
    }
  
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  }

  useEffect(() => {
    fetchNotesWithRefresh();
  }, []);

  return (
    <div className="signup">
      <div className="signup-left">
        <img className="logo" src={"logo.svg"} alt="logo" />
        <div className="signup-form" style={{ height: "90vh" }}>
          <form onSubmit={handleAddNote}>
            <div className="heading">TODOs</div>
            <div className="sub-heading" style={{ textTransform: "uppercase" }}>
              Hi {`${user.name || ""}`}!{" "}
              <button

                onClick={handlelogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
            <div className="sub-heading">Time to do some work!</div>

            <div className="notesform">
              <div className="textareadiv">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add notes"
                  required
                ></input>
                <button
                  style={{ display: "inline", width: "20%", margin: "0rem" }}
                  type="submit"
                  disabled={loading}
                  onClick={handleAddNote}
                  className="btn btn-submit"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>

              <div className="todo">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <li key={note._id} className="todo-item">
                      <span
                        onClick={() => markdone(note._id)}
                        className={note.completed ? "completed" : ""}
                      >
                        {note.text}
                      </span>
                      <button onClick={() => handleDeleteNote(note._id)}>
                        ❌
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="m-3">No notes yet. Add one!</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="signup-right">
        <img src={"sigupphoto.png"} alt="signup" />
      </div>
    </div>
  );
}
