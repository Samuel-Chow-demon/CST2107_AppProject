import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import bgImage from "../assets/bg-1.jpg";

const initialData = {
  columns: [], // Start with an empty board
};

const BoardDemo = () => {
  const [data, setData] = useState(initialData);
  const [editing, setEditing] = useState({ type: null, id: null });
  const inputRefs = useRef({});

  const addColumn = () => {
    const newColumn = {
      id: `column-${data.columns.length + 1}`,
      title: "New List",
      tasks: [],
    };
    setData({ ...data, columns: [...data.columns, newColumn] });
  };

  const addCard = (columnId) => {
    const newCard = {
      id: `task-${Date.now()}`,
      content: "New Card",
    };
    const updatedColumns = data.columns.map((col) =>
      col.id === columnId
        ? { ...col, tasks: [...col.tasks, newCard] }
        : col
    );
    setData({ ...data, columns: updatedColumns });
  };

  const deleteColumn = (columnId) => {
    const updatedColumns = data.columns.filter((col) => col.id !== columnId);
    setData({ ...data, columns: updatedColumns });
  };

  const deleteCard = (columnId, cardId) => {
    const updatedColumns = data.columns.map((col) => {
      if (col.id === columnId) {
        const updatedTasks = col.tasks.filter((task) => task.id !== cardId);
        return { ...col, tasks: updatedTasks };
      }
      return col;
    });
    setData({ ...data, columns: updatedColumns });
  };

  const handleRename = (id, type, value) => {
    if (type === "list") {
      const updatedColumns = data.columns.map((col) =>
        col.id === id ? { ...col, title: value } : col
      );
      setData({ ...data, columns: updatedColumns });
    } else if (type === "card") {
      const updatedColumns = data.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === id ? { ...task, content: value } : task
        ),
      }));
      setData({ ...data, columns: updatedColumns });
    }
    setEditing({ type: null, id: null });
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (type === "column") {
      const columns = Array.from(data.columns);
      const [removed] = columns.splice(source.index, 1);
      columns.splice(destination.index, 0, removed);
      setData({ ...data, columns });
    } else if (type === "task") {
      const sourceColumn = data.columns.find(
        (col) => col.id === source.droppableId
      );
      const destColumn = data.columns.find(
        (col) => col.id === destination.droppableId
      );

      if (!sourceColumn || !destColumn) return;

      const sourceTasks = Array.from(sourceColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);

      if (sourceColumn === destColumn) {
        sourceTasks.splice(destination.index, 0, removed);
        const updatedColumns = data.columns.map((col) =>
          col.id === source.droppableId
            ? { ...col, tasks: sourceTasks }
            : col
        );
        setData({ ...data, columns: updatedColumns });
      } else {
        const destTasks = Array.from(destColumn.tasks);
        destTasks.splice(destination.index, 0, removed);
        const updatedColumns = data.columns.map((col) => {
          if (col.id === source.droppableId) {
            return { ...col, tasks: sourceTasks };
          }
          if (col.id === destination.droppableId) {
            return { ...col, tasks: destTasks };
          }
          return col;
        });
        setData({ ...data, columns: updatedColumns });
      }
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
            >
              {data.columns.map((column, index) => (
                <Draggable
                  draggableId={column.id}
                  index={index}
                  key={column.id}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        padding: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        width: "250px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        {editing.type === "list" &&
                        editing.id === column.id ? (
                          <input
                            ref={(ref) => (inputRefs.current[column.id] = ref)}
                            defaultValue={column.title}
                            onBlur={(e) =>
                              handleRename(column.id, "list", e.target.value)
                            }
                            autoFocus
                            style={{
                              border: "1px solid #ddd",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          <h3
                            onDoubleClick={() =>
                              setEditing({ type: "list", id: column.id })
                            }
                            style={{
                              margin: 0,
                              fontSize: "16px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            {column.title}
                          </h3>
                        )}
                        <button
                          onClick={() => deleteColumn(column.id)}
                          style={{
                            marginLeft: "auto",
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#999",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                      <Droppable
                        droppableId={column.id}
                        type="task"
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {column.tasks.map((task, index) => (
                              <Draggable
                                draggableId={task.id}
                                index={index}
                                key={task.id}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      padding: "8px",
                                      marginBottom: "8px",
                                      backgroundColor: "#e0e0e0",
                                      borderRadius: "4px",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                    onDoubleClick={() =>
                                      setEditing({
                                        type: "card",
                                        id: task.id,
                                      })
                                    }
                                  >
                                    {editing.type === "card" &&
                                    editing.id === task.id ? (
                                      <input
                                        ref={(ref) =>
                                          (inputRefs.current[task.id] = ref)
                                        }
                                        defaultValue={task.content}
                                        onBlur={(e) =>
                                          handleRename(
                                            task.id,
                                            "card",
                                            e.target.value
                                          )
                                        }
                                        autoFocus
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "4px 8px",
                                          borderRadius: "4px",
                                          width: "80%",
                                        }}
                                      />
                                    ) : (
                                      <span
                                        style={{
                                          flex: 1,
                                        }}
                                      >
                                        {task.content}
                                      </span>
                                    )}
                                    <button
                                      onClick={() =>
                                        deleteCard(column.id, task.id)
                                      }
                                      style={{
                                        backgroundColor: "transparent",
                                        border: "none",
                                        color: "#f44336",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      -
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <button
                        onClick={() => addCard(column.id)}
                        style={{
                          backgroundColor: "#0079bf",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          marginTop: "8px",
                        }}
                      >
                        + Add Card
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <button
                onClick={addColumn}
                style={{
                  padding: "16px",
                  border: "2px dashed #0079bf",
                  backgroundColor: "transparent",
                  color: "#0079bf",
                  cursor: "pointer",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
              >
                + Add List
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardDemo;
