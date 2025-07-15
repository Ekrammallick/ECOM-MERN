import Product from "../models/product.model.js"
export const getAllProducts = async (req,res)=>{
    try {
        const products = await Product.find({});
        res.json({products})
    } catch (error) {
        console.log("Error in the getProducts controller",error.message);
        res.status(500).json({message:"server error",error:error.message})
    }
}

export const getFeaturedProducts = async (req,res)=>{
    try {
        let featuredProducts = await redis.get("featured_products");
         if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
         }
         featuredProducts = await Product.find({isFeature:true}).lean();
        if(!featuredProducts){
            return res.status(404).json({message:"no featured products found"});
        }
        await redis.set("feature_products",JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in getFeatureProducts controller",error.message);
        res.status(500).json({message:"server error",error:error.message})
    }
}