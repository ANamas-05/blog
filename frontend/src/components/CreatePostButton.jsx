import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CreatePostButton = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return null;
    }

    return (
        <Link to="/create-post" className="create-post-button" title="Create New Post">
            +
        </Link>
    );
};

export default CreatePostButton;