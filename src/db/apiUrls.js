import supabase, {supabaseUrl} from "./supabase";

export async function getUrls(user_id) {
  let {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load URLs");
  }

  return data;
}

export async function getUrl({id, user_id}) {
  const {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Short Url not found");
  }

  return data;
}

export async function getLongUrl(id) {
  console.log("getLongUrl called with id:", id);
  
  try {
    let {data: shortLinkData, error: shortLinkError} = await supabase
      .from("urls")
      .select("id, original_url")
      .or(`short_url.eq.${id},custom_url.eq.${id}`)
      .maybeSingle(); // Use maybeSingle() instead of limit(1)

    console.log("Database query result:", {shortLinkData, shortLinkError});

    if (shortLinkError) {
      console.error("Error fetching short link:", shortLinkError);
      throw new Error(shortLinkError.message);
    }

    if (!shortLinkData) {
      console.log("No data found for id:", id);
      return null;
    }

    console.log("Returning data:", shortLinkData);
    return shortLinkData;
  } catch (error) {
    console.error("Exception in getLongUrl:", error);
    throw error;
  }
}

export async function createUrl({title, longUrl, customUrl, user_id}, qrcode) {
  const short_url = Math.random().toString(36).substr(2, 6);
  const fileName = `qr-${short_url}`;

  const {error: storageError} = await supabase.storage
    .from("qrs")
    .upload(fileName, qrcode);

  if (storageError) throw new Error(storageError.message);

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  const {data, error} = await supabase
    .from("urls")
    .insert([
      {
        title,
        user_id,
        original_url: longUrl,
        custom_url: customUrl || null,
        short_url,
        qr,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error creating short URL");
  }

  return data;
}

export async function deleteUrl(id) {
  const {data, error} = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unable to delete Url");
  }

  return data;
}