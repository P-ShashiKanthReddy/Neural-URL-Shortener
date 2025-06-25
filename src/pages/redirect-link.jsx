import {storeClicks} from "@/db/apiClicks";
import {getLongUrl} from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {BarLoader} from "react-spinners";

const RedirectLink = () => {
  const {id} = useParams();
  console.log("RedirectLink component loaded with id:", id);

  const {loading, data, fn, error} = useFetch(getLongUrl, id);

  const {loading: loadingStats, fn: fnStats} = useFetch(storeClicks, {
    id: data?.id,
    originalUrl: data?.original_url,
  });

  useEffect(() => {
    console.log("useEffect triggered, calling fn()");
    fn();
  }, []);

  useEffect(() => {
    console.log("Data effect triggered:", {loading, data, error});
    if (!loading && data && data.original_url) {
      console.log("Found URL data, calling fnStats:", data);
      fnStats();
    } else if (!loading && !data && !error) {
      console.log("No data found for ID:", id);
    }
  }, [loading, data, error]);

  console.log("Current state:", {loading, data, error, loadingStats});

  // Show loading state
  if (loading || loadingStats) {
    console.log("Showing loading state");
    return (
      <>
        <BarLoader width={"100%"} color="#36d7b7" />
        <br />
        Redirecting...
      </>
    );
  }

  // If there's an error, show error message
  if (error) {
    console.log("Showing error page - Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-600 mt-2">Failed to load the link: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">
          Debug: ID="{id}", Error={error.message}
        </p>
      </div>
    );
  }

  // If no data found, show not found message
  if (!data) {
    console.log("Showing not found page - No data for ID:", id);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Link not found</h1>
        <p className="text-gray-600 mt-2">The short URL "{id}" doesn't exist.</p>
        <p className="text-sm text-gray-500 mt-2">
          Please check if the URL is correct or if the link has been deleted.
        </p>
      </div>
    );
  }

  console.log("Component render complete - should have redirected by now");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p>If you see this, something went wrong with the redirect.</p>
      <p className="text-sm text-gray-500 mt-2">
        Debug info: loading={loading ? 'true' : 'false'}, 
        data={data ? JSON.stringify(data) : 'null'}, 
        error={error?.message || 'none'}
      </p>
    </div>
  );
};

export default RedirectLink;