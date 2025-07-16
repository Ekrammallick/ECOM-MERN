// utils/cloudinary.utils.js
import cloudinary from "../lib/cloudinary.js";

export const deleteCloudinaryImage = async (imageUrl) => {
    try {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Deleted image from Cloudinary");
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error.message);
    }
};
