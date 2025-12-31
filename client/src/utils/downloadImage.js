import axios from "axios";

async function downloadImage(imageUrl){
    try{
      const response = await axios.get(imageUrl, { responseType: 'blob' });      
      const blob = response.data; 
      
      const extension = blob.type.split('/')[1] || 'png';
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `generated-image-${Date.now()}.${extension}`;
      
      document.body.appendChild(link);
      link.click();      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch(err){
      console.log(err)
      let msg = err?.response?.data?.message || err.message || "Something went wrong";
      window.alert((err.name=="InvalidCharacterError")?"Invalid Image URL":msg)
    }
}

export { downloadImage };