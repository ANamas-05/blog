import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchPosts } from '../api';
import toast from 'react-hot-toast';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            const fetchResults = async () => {
                try {
                    setLoading(true);
                    const { data } = await searchPosts(query);
                    setResults(data.posts || []);
                } catch (err) {
                    toast.error("Failed to fetch search results.");
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [query]);

    if (loading) return <p>Searching...</p>;

    return (
        <div>
            <h1>Search Results for "{query}"</h1>
            {results.length > 0 ? (
                results.map(post => (
                    <Link to={`/posts/${post.id}`} key={post.id} className="post-card">
                        <h2>{post.title}</h2>
                        <p>by {post.author}</p>
                    </Link>
                ))
            ) : (
                <p>No posts found matching your search.</p>
            )}
        </div>
    );
};

export default SearchResults;