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
    recurring: false,
    notifications: false,
    storyPoints: "",
    colorTag: "#000000",
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

  const handleChecklistChange = (index, value) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index] = value;
    setFormData({ ...formData, checklist: newChecklist });
  };

  const addChecklistItem = () => {
    setFormData({ ...formData, checklist: [...formData.checklist, ""] });
  };

  const removeChecklistItem = (index) => {
    const newChecklist = formData.checklist.filter((_, i) => i !== index);
    setFormData({ ...formData, checklist: newChecklist });
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
      checklist: [""],
      startDate: "",
      attachments: null,
      dependencies: "",
      recurring: false,
      notifications: false,
      storyPoints: "",
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

      <label>
        Due Date
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleInputChange}
        />
      </label>

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
        {formData.checklist.map((item, index) => (
          <div key={index} className="checklist-item">
            <input
              type="text"
              value={item}
              onChange={(e) => handleChecklistChange(index, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeChecklistItem(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addChecklistItem} className="add-btn">
          Add Item
        </button>
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
        Start Date
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
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

      <label>
        Recurring Task
        <input
          type="checkbox"
          name="recurring"
          checked={formData.recurring}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Enable Notifications
        <input
          type="checkbox"
          name="notifications"
          checked={formData.notifications}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Story Points
        <input
          type="number"
          name="storyPoints"
          value={formData.storyPoints}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Color Tag
        <input
          type="color"
          name="colorTag"
          value={formData.colorTag}
          onChange={handleInputChange}
        />
      </label>

      <button type="submit" className="submit-btn">Create Task</button>
    </form>
  );
};

export default TaskForm;
