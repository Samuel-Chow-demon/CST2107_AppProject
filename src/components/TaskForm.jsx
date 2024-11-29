import React, { useState } from "react";
import "./TaskForm.css";

const TaskForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignee: "",
    labels: [],
    checklist: [""],
    startDate: "",
    attachments: null,
    dependencies: "",
    notifications: false, // Temporarily remarked
    colorTag: "#000000", // Temporarily remarked
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleChecklistChange = (value) => {
    setFormData({ ...formData, checklist: [...formData.checklist, value] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      assignee: "",
      labels: [],
      checklist: [],
      startDate: "",
      attachments: null,
      dependencies: "",
      notifications: false,
      colorTag: "#000000",
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
      </label>

      <div className="date-row">
        <label>
          Start Date
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Due Date
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
        </label>
      </div>

      <label>
        Priority
        <select
          name="priority"
          value={formData.priority}
          onChange={handleInputChange}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </label>

      <label>
        Assignee
        <input
          type="text"
          name="assignee"
          value={formData.assignee}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Checklist
        <div className="checklist-input">
          <input
            type="text"
            placeholder="Add checklist item"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim() !== "") {
                handleChecklistChange(e.target.value.trim());
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            className="add-btn"
            onClick={() => {
              const inputField = document.querySelector(".checklist-input input");
              if (inputField.value.trim() !== "") {
                handleChecklistChange(inputField.value.trim());
                inputField.value = "";
              }
            }}
          >
            +
          </button>
        </div>
        <select className="checklist-dropdown">
          {formData.checklist.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label>
        Attachments
        <input
          type="file"
          name="attachments"
          onChange={handleInputChange}
          multiple
        />
      </label>

      <label>
        Dependencies
        <input
          type="text"
          name="dependencies"
          value={formData.dependencies}
          onChange={handleInputChange}
        />
      </label>

      {/* Temporarily remarked Enable Notifications */}
      {/* <label>
        Enable Notifications
        <input
          type="checkbox"
          name="notifications"
          checked={formData.notifications}
          onChange={handleInputChange}
        />
      </label> */}

      {/* Temporarily remarked Color Tag */}
      {/* <label>
        Color Tag
        <input
          type="color"
          name="colorTag"
          value={formData.colorTag}
          onChange={handleInputChange}
        />
      </label> */}

      <button type="submit" className="submit-btn">
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
