import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import { getPost, createPost, updatePostApi } from '../api';
import toast from 'react-hot-toast';

const PostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categories, setCategories] = useState('');
    const [tags, setTags] = useState('');
    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            const fetchPost = async () => {
                try {
                    const { data } = await getPost(id);
                    setTitle(data.title);
                    setContent(data.content);
                    setImageUrl(data.image_url || '');
                    setCategories(data.categories.join(', '));
                    setTags(data.tags.join(', '));
                } catch (error) {
                    toast.error("Could not load post data for editing.");
                    navigate('/');
                }
            };
            fetchPost();
        }
    }, [id, isEditing, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const postData = {
                title,
                content,
                image_url: imageUrl,
                categories: categories.split(',').map(c => c.trim()).filter(Boolean),
                tags: tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (isEditing) {
                await updatePostApi(id, postData);
                toast.success('Post updated successfully!');
                navigate(`/posts/${id}`);
            } else {
                const { data: newPost } = await createPost(postData);
                toast.success('Post created successfully!');
                navigate(`/posts/${newPost.id}`);
            }
        } catch (error) {
            toast.error("Failed to save post.");
        }
    };

    return (
        <div>
            <h2>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSubmit}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
                <ReactQuill theme="snow" value={content} onChange={setContent} />
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" />
                <input value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="Categories (comma, separated)" />
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma, separated)" />
                <button type="submit">{isEditing ? 'Update Post' : 'Create Post'}</button>
            </form>
        </div>
    );
};

export default PostForm;