import toast from 'react-hot-toast';

export const toastSuccess = (message: string) => {
  toast.success(message, {
    position: "bottom-right",
    duration: 6000,
    style: { 
      background: "#059669", // green-600
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500"
    },
  });
};

export const toastError = (message: string) => {
  toast.error(message, {
    position: "bottom-right",
    duration: 6000,
    style: { 
      background: "#C5221F", 
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500"
    },
  });
};

export const toastWarning = (message: string) => {
  toast(message, {
    position: "bottom-right",
    duration: 6000,
    style: { 
      background: "#D97706", // amber-600
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500"
    },
  });
};

export const toastInfo = (message: string) => {
  toast(message, {
    position: "bottom-right",
    duration: 4000,
    style: { 
      background: "#2563EB", // blue-600
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500"
    },
  });
};