
import { useEffect, useState } from "react";
import { ImagePlus, RefreshCw, Upload } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export default function WalkinPosterManager() {
  const [poster, setPoster] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadPoster() {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("jobhub_admin_token");

      if (!token) {
        throw new Error("Admin login nahi mila. Dobara login karein.");
      }

      const response = await fetch(
        `${API_URL}/admin/walkin-poster`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Current poster load nahi ho paaya."
        );
      }

      setPoster(data.poster || null);
    } catch (err) {
      setError(err.message || "Poster load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPoster();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Pehle poster image select karein.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image ka size 5 MB se kam hona chahiye.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Sirf JPG, PNG ya WEBP image upload karein.");
      return;
    }

    setSaving(true);

    try {
      const token = sessionStorage.getItem("jobhub_admin_token");

      if (!token) {
        throw new Error("Admin login nahi mila. Dobara login karein.");
      }

      const formData = new FormData();
      formData.append("poster", file);

      const response = await fetch(
        `${API_URL}/admin/walkin-poster`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Poster upload nahi ho paaya."
        );
      }

      setPoster(data.poster || null);
      setFile(null);
      setMessage(data.message || "Poster successfully update ho gaya.");
    } catch (err) {
      setError(err.message || "Poster upload nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <ImagePlus size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Walk-in Drive Poster
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Yahan se poster upload ya replace karein.
              Premium users ko updated poster dikhaya jayega.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-5 p-5 sm:p-6">
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {message}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RefreshCw size={17} className="animate-spin" />
            Current poster load ho raha hai...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Current poster
              </p>

              {poster?.imageUrl ? (
                <img
                  src={poster.imageUrl}
                  alt="Current Walk-in Drive poster"
                  className="max-h-80 w-full rounded-xl border border-slate-200 object-contain"
                />
              ) : (
                <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                  Abhi koi poster upload nahi hua hai.
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="walkin-poster-file"
                className="mb-3 block text-sm font-semibold text-slate-700"
              >
                Naya poster select karein
              </label>

              <input
                id="walkin-poster-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setError("");
                  setMessage("");
                }}
                className="block w-full rounded-xl border border-slate-200 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700"
              />

              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG ya WEBP. Maximum size 5 MB.
              </p>

              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Upload preview
                  </p>
                  <img
                    src={preview}
                    alt="New poster preview"
                    className="max-h-64 w-full rounded-xl border border-slate-200 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving || loading || !file}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <Upload size={17} />
            )}

            {saving ? "Uploading..." : "Upload / Update Poster"}
          </button>

          <button
            type="button"
            onClick={loadPoster}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </form>
    </section>
  );
}
