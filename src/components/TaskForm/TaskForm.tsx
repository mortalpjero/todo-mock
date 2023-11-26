import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { Schema } from "yup";
import { RootState } from "../../slices";
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { createTask, updateTask } from "../../services/api";
import { addTaskToState, updateTaskInState } from "../../slices/tasksSlice";
import { setTaskToEdit, setNewTitle, setNewBody } from "../../slices/editTaskSlice";
import Button from "../Button/Button";
import { ReactComponent as AddIcon } from '../../images/add_icon.svg';
import { ReactComponent as SaveIcon } from '../../images/save_icon.svg';
import { ReactComponent as CancelIcon } from '../../images/cancel_icon.svg';
import Error from "../Error/Error";
import { setModal } from "../../slices/modalSlice";

type TaskFormProps = {
  validation: Schema<any>;
  formType: string;
};

interface Values {
  id?: number | undefined;
  taskTitle: string | undefined;
  taskBody: string | undefined;
  completed: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ validation, formType }) => {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const taskToEdit = useSelector((state: RootState) => state.editTaskInfo.taskToEdit);
  const [updatedTitle, setUpdatedTitle] = useState(taskToEdit?.title);
  const [updatedBody, setUpdatedBody] = useState(taskToEdit?.body)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (formType === 'editTask') {
      if (updatedBody && updatedTitle) {
        dispatch(setNewBody(updatedBody));
        dispatch(setNewTitle(updatedTitle));
      }
    }
  }, [updatedTitle, updatedBody, formType, dispatch])

  const handleAddChannelSubmit = (values: Values, resetForm: Function) => {
    if (values.taskTitle && values.taskBody) {
      setIsLoading(true);
      const newTask = {
        title: values.taskTitle,
        body: values.taskBody,
        completed: false,
      }
      createTask(newTask)
        .then((response) => {
          dispatch(addTaskToState(response));
          setErrorMessage('');
        })
        .catch((error) => {
          console.log('error create');
          setErrorMessage(`Error creating task ${error}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
      resetForm();
    }
    else {
      console.error('Task name or description is not specified');
    }
  }

  const handleEditChannelSubmit = (values: Values) => {
    if (values.taskTitle && values.taskBody && taskToEdit?.id) {
      setIsLoading(true);
      const changedTask = {
        title: values.taskTitle,
        body: values.taskBody,
        completed: false,
      }
      updateTask(changedTask, taskToEdit.id)
        .then((response) => {
          dispatch(updateTaskInState(response));
          setErrorMessage('');
        })
        .catch((error) => {
          console.log('error')
          setErrorMessage(`Error changing task ${error}`);
        })
        .finally(() => {
          setIsLoading(false);
        })
      dispatch(setTaskToEdit(null));
    }
    else {
      console.error('Task name or description is not specified or task id is missing');
    }
  }

  const handleDiscardClick = () => {
    if (taskToEdit?.title !== updatedTitle || taskToEdit?.body !== updatedBody) {
      dispatch(setModal({type: 'discardChanges'}));
    } else {
      dispatch(setTaskToEdit(null));
    }
  }

  const genInitialValues = (): Values => {
    if (formType === 'editTask') {
      return {
        taskTitle: taskToEdit?.title,
        taskBody: taskToEdit?.body,
        completed: taskToEdit?.completed || false
      };
    }
    return { taskTitle: '', taskBody: '', completed: false };
  };
  const initialValues = genInitialValues();

  const formik = useFormik({
    initialValues,
    validationSchema: validation,
    onSubmit: (values, { resetForm }) => {
      if (formType === 'addTask') {
        return handleAddChannelSubmit(values, resetForm);
      }
      if (formType === 'editTask') {
        return handleEditChannelSubmit(values);
      }
      console.error('Unknown Form Format');
    }
  })

  const { handleChange, handleSubmit, errors, touched } = formik;
  const { taskTitle, taskBody } = formik.values;

  const taskTitleClasses = classNames(
    'border',
    'border-gray-300',
    'text-gray-900',
    'text-sm',
    'rounded-lg',
    'focus:ring-primary-600',
    'focus:border-primary-600',
    'block',
    'w-full',
    'p-2',
    'dark:bg-gray-600',
    'dark:border-gray-500',
    'dark:placeholder-gray-400',
    'dark:text-white',
    'dark:focus:ring-primary-500',
    'dark:focus:border-primary-500',
    touched.taskTitle && errors.taskTitle ? 'border-red-200' : 'bg-gray-50',
  )

  const taskBodyClasses = classNames(
    'block',
    'p-2',
    'w-full',
    'text-sm',
    'text-gray-900',
    'rounded-lg',
    'border',
    'border-gray-300',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'dark:bg-gray-600',
    'dark:border-gray-500',
    'dark:placeholder-gray-400',
    'dark:text-white',
    'dark:focus:ring-blue-500',
    'dark:focus:border-blue-500',
    'overflow-hidden',
    'overflow-ellipsis',
    touched.taskBody && errors.taskBody ? 'border-red-200' : 'bg-gray-50',
  )

  return (
    <form onSubmit={handleSubmit} ref={ref}>
      <div className="grid gap-4 mb-4 grid-cols-2">
        <div className="col-span-2">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Task Name
          </label>
          <input
            type="text"
            name="taskTitle"
            id="name"
            className={taskTitleClasses}
            placeholder="Type the name of a task"
            value={taskTitle}
            onChange={(e) => {
              handleChange(e);
              if (formType === 'editTask') {
                setUpdatedTitle(e.target.value);
              }
            }
            }
          />
          {errors.taskTitle && touched.taskTitle && <Error text={errors.taskTitle} />}
        </div>
        <div className="col-span-2">
          <label
            htmlFor="body"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Task Description
          </label>
          <textarea
            id="body"
            rows={4}
            name='taskBody'
            className={taskBodyClasses}
            placeholder="Write the description of a task"
            value={taskBody}
            onChange={(e) => {
              handleChange(e);
              if (formType === 'editTask') {
                setUpdatedBody(e.target.value);
              }
            }
            }
          />
          {errors.taskBody && touched.taskBody && <Error text={errors.taskBody} />}
        </div>
        <div className="item col-span-full">
          {errorMessage && <Error text={errorMessage} />}
        </div>
        <div className="flex item col-span-full">
          {formType === 'addTask' && <Button variant='primary' icon={<AddIcon />} type={'submit'} disabled={isLoading}>Add New Task</Button>}
          {formType === 'editTask' && <Button variant='secondary' icon={<SaveIcon />} type={'submit'} disabled={isLoading}>Save Changes</Button>}
          {formType === 'editTask' && <Button variant='danger' icon={<CancelIcon />} type={'button'} disabled={isLoading} specialClass="ml-4" onClick={handleDiscardClick}>Discard</Button>}
        </div>
      </div>
    </form>
  )
};

export default TaskForm;
