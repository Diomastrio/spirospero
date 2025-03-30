import React, { useState } from "react";
import { ArrowLeft, Upload, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useCreateNovel } from "../services/novelHooks";

const CreateNovel = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    genre: "",
    status: "",
  });

  const { createNovel, isLoading } = useCreateNovel();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createNovel(formData);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-base-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <BookOpen className="mr-3 text-primary" size={24} />
            <h1 className="text-2xl font-bold">Create New Novel</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {formData.cover_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.cover_image_url}
                        alt="Cover preview"
                        className="max-h-60 mx-auto rounded-md"
                      />
                      <button
                        type="button"
                        className="mt-2 text-sm text-red-500 hover:text-red-700"
                        onClick={() =>
                          setFormData({ ...formData, cover_image_url: "" })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Provide a URL for your novel cover
                      </p>
                    </div>
                  )}
                  <input
                    type="text"
                    name="cover_image_url"
                    placeholder="https://example.com/your-image.jpg"
                    className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.cover_image_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your novel's title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write a compelling description of your novel..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Genre */}
              <div>
                <label
                  htmlFor="gnere"
                  className="block text-sm font-medium mb-2"
                >
                  Associated Genre (optional)
                </label>
                <input
                  id="genre"
                  name="genre"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Fantasy, Romance, Mystery, Sci-Fi"
                  value={formData.genre}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">On Hiatus</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn btn-primary px-6 ${
                    isLoading ? "loading" : ""
                  }`}
                >
                  {isLoading ? "Creating..." : "Create Novel"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNovel;
