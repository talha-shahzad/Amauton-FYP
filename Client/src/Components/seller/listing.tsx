// @ts-nocheck
import { useState } from "react";
import './listing.css'

const ProductDetailsButton = ({ asin }) => {
    const [showModal, setShowModal] = useState(false);
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/product/details?ASIN=${asin}`);
            const data = await response.json();
            setProductDetails(data);
        } catch (error) {
            console.error("Error fetching product details:", error);
        } finally {
            setLoading(false);
            setShowModal(true);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/product/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productDetails),
            });

            if (response.ok) {
                alert("Product updated successfully!");
            } else {
                alert("Failed to update product.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    return (
        <>
            <button onClick={fetchProductDetails} className="details-btn">
                Listings
            </button>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                    <h2 className="modal-title">Product Details</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            productDetails && (
                                <div>
                                    <form className="product-form">
                                        {/* <label>ASIN:</label>
                                        <input type="text" className="form-group" name="ASIN" value={productDetails.ASIN} readOnly /> */}

                                        <label>Title:</label>
                                        <input type="text" className="form-group" name="item_name" value={productDetails.item_name} onChange={handleChange} />

                                        <label>Brand:</label>
                                        <input type="text" className="form-group" name="brand" value={productDetails.brand} onChange={handleChange} />

                                        <label>Manufacturer:</label>
                                        <input type="text" className="form-group" name="manufacturer" value={productDetails.manufacturer} onChange={handleChange} />

                                        <label>Marketplace ID:</label>
                                        <input type="text" className="form-group" name="marketplaceId" value={productDetails.marketplaceId} onChange={handleChange} />

                                        <label>Model Number:</label>
                                        <input type="text" className="form-group" name="model_number" value={productDetails.model_number} onChange={handleChange} />

                                        <label>Description:</label>
                                        <textarea name="description"  className="form-group full-width" value={productDetails.description} onChange={handleChange} />


                                        <label>Total Quantity:</label>
                                        <input type="number" className="form-group" name="Total_Quantity" value={productDetails.Total_Quantity} onChange={handleChange} />


                                        <label>Price:</label>
                                        <input type="text" className="form-group"  name="price" value={productDetails.price?.value || ""} onChange={handleChange} />

                                        <input type="file" step="0.01" name="Image" value={productDetails.images[0].value || ""}/>
                                        <button className="close-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="button" className="update-btn full-width" onClick={handleUpdate}>
                                            List Product
                                        </button>
                                    </form>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetailsButton;