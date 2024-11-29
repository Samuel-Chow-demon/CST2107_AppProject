import React, { useState } from "react";
import "./ProjectForm.css";

const ProjectForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    teamMembers: [],
    attachments: null,
    goals: "",
  });

  const [teamMember, setTeamMember] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddTeamMember = () => {
    if (teamMember.trim() !== "") {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, teamMember.trim()],
      });
      setTeamMember(""); // Clear the input field
    }
  };

  const handleRemoveTeamMember = (index) => {
    const updatedTeamMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: updatedTeamMembers });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <label>
        Project Title
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
          required
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
          End Date
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </label>
      </div>

      <label>
        Goals
        <input
          type="text"
          name="goals"
          value={formData.goals}
          onChange={handleInputChange}
          placeholder="Enter project goals"
        />
      </label>

      <div className="team-member-container">
        <div className="team-member-input">
          <input
            type="text"
            placeholder="Add team member"
            value={teamMember}
            onChange={(e) => setTeamMember(e.target.value)}
          />
          <button type="button" className="add-btn" onClick={handleAddTeamMember}>
            +
          </button>
        </div>
        <ul className="team-member-list">
          {formData.teamMembers.map((member, index) => (
            <li key={index} className="team-member-item">
              <span className="avatar">{member.charAt(0).toUpperCase()}</span>
              <span>{member}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveTeamMember(index)}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
      </div>

      <label>
        Attachments
        <input
          type="file"
          name="attachments"
          onChange={handleInputChange}
          multiple
        />
      </label>

      <button type="submit" className="submit-btn">Create Project</button>
    </form>
  );
};

export default ProjectForm;
