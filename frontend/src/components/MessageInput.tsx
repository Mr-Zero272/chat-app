import { Image, Send, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/useChatStore';

const MessageInput = () => {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            // Clear form
            setText('');
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="w-full p-4">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview as string}
                            alt="Preview"
                            className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-base-300"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex flex-1 gap-2">
                    <input
                        type="text"
                        className="input input-sm input-bordered w-full rounded-lg sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`btn btn-circle hidden sm:flex ${imagePreview ? 'text-emerald-500' : 'text-zinc-400'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>
                <button type="submit" className="btn btn-circle btn-sm" disabled={!text.trim() && !imagePreview}>
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
