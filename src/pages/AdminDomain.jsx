import { CommentDBProvider } from "../context/commentDBContext"
import { ProjectDBProvider } from "../context/projectDBContext"
import { StateDBProvider } from "../context/stateDBContext"
import { TaskDBProvider } from "../context/taskDBContext"
import Admin from "./Admin"

const AdminDomain = () => {
  return (
    <ProjectDBProvider workingWorkSpaceID={null}>
          <StateDBProvider workingProjectID={null}>
            <TaskDBProvider>
                <CommentDBProvider>
                    <Admin />
                </CommentDBProvider>
            </TaskDBProvider>
        </StateDBProvider>
    </ProjectDBProvider>
  )
}

export default AdminDomain