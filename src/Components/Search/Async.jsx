import { useEffect, useState } from "react";
import Select1 from "./Select1";

const mergeValueIntoOptions = (options, value) => {
  if (!value) return options;
  const found = options.find(o => o.id === value.id);
  if (found) return options;
  return [value, ...options];
};

const Async = () => {
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=20"
        );

        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();

        setOptions(
          data.map(item => ({
            id: item.id,
            label: `${item.id} - ${item.title}`
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchDefaultPost = async () => {
      try {
        const res = await fetch(
          "https://jsonplaceholder.typicode.com/posts/100"
        );

        if (!res.ok) throw new Error("Failed to fetch default post");

        const post = await res.json();

        setValue({
          id: post.id,
          label: `${post.id} - ${post.title}`
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDefaultPost();
  }, []);

  const mergedOptions = mergeValueIntoOptions(options, value);

  return (
    <div className="form-container">
      <Select1
        label="Select Post"
        options={mergedOptions}
        value={value}
        onChange={setValue}
        onClear={() => setValue(null)}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Async;
