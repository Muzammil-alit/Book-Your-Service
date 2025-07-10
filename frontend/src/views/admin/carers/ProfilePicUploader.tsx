import React from "react";

interface ProfilePicUploaderProps {
    profilePic: File | null;
    setProfilePic: React.Dispatch<React.SetStateAction<File | null>>
    initialImageUrl?: string | File; 
    onRemove?: () => void;
    isAddPopUp?: boolean;
}

const ProfilePicUploader: React.FC<ProfilePicUploaderProps> = ({
    profilePic,
    setProfilePic,
    initialImageUrl,
    onRemove,
    isAddPopUp = false,
}) => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Maximum file size: 3MB in bytes
    const MAX_FILE_SIZE = 3 * 1024 * 1024;

    React.useEffect(() => {
        setImageUrl(initialImageUrl || null);
    }, [initialImageUrl]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const allowedTypes = ["image/jpeg", "image/png"];

            if (!allowedTypes.includes(file.type)) {
                setError("Only JPG and PNG files are allowed.");
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setError("File size exceeds 3MB limit.");
                return;
            }

            setProfilePic(file);
            setImageUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleRemove = () => {
        setProfilePic(null);
        setImageUrl(null);
        setError(null);

        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (onRemove) {
            onRemove();
        }
    };

    React.useEffect(() => {
        if (isAddPopUp && !profilePic) {
            setImageUrl(null);
            // Clear the file input value when modal is closed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [profilePic, isAddPopUp]);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-40">
                <label className="w-full h-full rounded-full border-2 border-gray-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-100 hover:bg-gray-200 transition text-center ">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Profile Pic" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <i className="ri-camera-line text-gray-500 text-3xl mb-2"></i>
                            <span className="text-gray-500 text-sm leading-tight">Upload Profile Picture</span>
                            <span className="text-gray-400 text-xs mt-1">(Max 3MB)</span>
                        </div>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                    />
                </label>

                {imageUrl && (
                    <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition"
                        onClick={handleRemove}
                    >
                        <i className="ri-delete-bin-6-line text-white text-sm"></i>
                    </button>
                )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default ProfilePicUploader;