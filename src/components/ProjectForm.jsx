import React, { useState } from "react";
import "./ProjectForm.css";

const ProjectForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    teamMembers: [{ name: "", role: "" }],
    colorTheme: "#3f51b5",
    visibility: "Private",
    labels: [],
    attachments: null,
    goals: [""],
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

  const handleTeamChange = (index, field, value) => {
    const newTeam = [...formData.teamMembers];
    newTeam[index][field] = value;
    setFormData({ ...formData, teamMembers: newTeam });
  };

  const addTeamMember = () => {
    setFormData({ ...formData, teamMembers: [...formData.teamMembers, { name: "", role: "" }] });
  };

  const removeTeamMember = (index) => {
    const newTeam = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: newTeam });
  };

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const addGoal = () => {
    setFormData({ ...formData, goals: [...formData.goals, ""] });
  };

  const removeGoal = (index) => {
    const newGoals = formData.goals.filter((_, i) => i !== index);
    setFormData({ ...formData, goals: newGoals });
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
        End Date
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
        />
      </label>

      <fieldset>
        <legend>Team Members</legend>
        {formData.teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={(e) => handleTeamChange(index, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Role"
              value={member.role}
              onChange={(e) => handleTeamChange(index, "role", e.target.value)}
            />
            <button type="button" onClick={() => removeTeamMember(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addTeamMember}>
          Add Member
        </button>
      </fieldset>

      <label>
        Color Theme
        <input
          type="color"
          name="colorTheme"
          value={formData.colorTheme}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Visibility
        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleInputChange}
        >
          <option value="Private">Private</option>
          <option value="Public">Public</option>
        </select>
      </label>

      <fieldset>
        <legend>Project Goals</legend>
        {formData.goals.map((goal, index) => (
          <div key={index} className="goal-item">
            <input
              type="text"
              value={goal}
              onChange={(e) => handleGoalChange(index, e.target.value)}
            />
            <button type="button" onClick={() => removeGoal(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addGoal}>
          Add Goal
        </button>
      </fieldset>

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
