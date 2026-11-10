import {toast} from 'react-toastify';

export const errorToast = (message: string) => {
    toast.error(message, {toastId: message});
};

export const successToast = (message: string) => {
    toast.success(message, {toastId: message});
};
