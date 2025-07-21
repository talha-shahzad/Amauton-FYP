// @ts-nocheck
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './ProductList.css';
import LoadingOverlay from './loading';
import ProductDetailsButton from './listing'

// Force WebSocket to be used and avoid polling
const socket = io('http://localhost:3000', {
    transports: ['websocket'],
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});
interface Price {
    currency: string;
    value: number;
}

interface Image {
    variant: string;
    link: string;
    height: number;
    width: number;
}

// Define a type for the product data
interface Product {
    _id: string;
    item_name: string;
    images: Image[];
    BSR: number;
    Item_Sold: number;
    Reviews: number;
    Rating: number;
    brand: string;
    price: Price;
    link: string;
    discount_price: string;
    actual_price: string;
}

interface ProductListProps {
    keyword: string;
}

const ProductList: React.FC<ProductListProps> = ({ keyword }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [productsPerPage] = useState<number>(12); // Number of products per page
    const [selectedRating, setSelectedRating] = useState<string>(''); // Rating filter
    const [selectedSoldCount, setSelectedSoldCount] = useState<string>(''); // Sold count filter
    const [selectedBSRClass, setSelectedBSRClass] = useState<string>(''); // BSR Classification filter
    const [googleProducts, setGoogleProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    // Dummy data for similar products from other stores
    const similarProducts = [
        {
            storeName: 'Amazon.com',
            productTitle: 'Purina Fancy Feast Grilled Wet Cat Food Variety Pack - (Pack of 24) 3 oz. Cans',
            price: '$21',
            oldPrice: '$23',
            deliveryPrice: '$6.99 delivery',
            link: 'https://www.amazon.com/Purina-Fancy-Feast-Grilled-Collection/dp/B001STX13U?source=ps-sl-shoppingads-lpcontext&ref_=fplfs&psc=1&smid=ATVPDKIKX0DER',
            productImage: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRxxSla1OLG_KR8qIR-sDChMLpCpnNgdqb7mVhHN6D7OIwDZaeTso8OEWT6PsxMzPzthOn3g14nJup0T-c6rySIADkXB_C1q_NqNTpZbeUQWkhgVx0wZpN6IQ',
            similarityIndex: 95,
        },
        {
            storeName: 'Walmart',
            productTitle: 'Purina Fancy Feast Grilled Wet Cat Food in Variety Pack',
            price: '$19.99',
            oldPrice: '$22',
            deliveryPrice: '$5.99 delivery',
            link: 'https://www.walmart.com/',
            productImage: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRxxSla1OLG_KR8qIR-sDChMLpCpnNgdqb7mVhHN6D7OIwDZaeTso8OEWT6PsxMzPzthOn3g14nJup0T-c6rySIADkXB_C1q_NqNTpZbeUQWkhgVx0wZpN6IQ',
            similarityIndex: 90,
        },
        {
            storeName: 'eBay',
            productTitle: 'Purina Fancy Feast Wet Cat Food, Variety Pack',
            price: '$20.49',
            oldPrice: '$24',
            deliveryPrice: '$4.99 delivery',
            link: 'https://www.ebay.com/',
            productImage: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRxxSla1OLG_KR8qIR-sDChMLpCpnNgdqb7mVhHN6D7OIwDZaeTso8OEWT6PsxMzPzthOn3g14nJup0T-c6rySIADkXB_C1q_NqNTpZbeUQWkhgVx0wZpN6IQ',
            similarityIndex: 88,
        },
    ];

    // useEffect(() => {
    //     const handleDataUpdate = (newData: Product[]) => {
    //         console.log('Received updated products:', newData); // Debug log
    //         setProducts([...newData]); // Spread to ensure new reference
    //         setCurrentProducts([...newData]); // Spread to ensure new reference
    //     };

    //     // Listen for real-time updates
    //     socket.on('data-update', handleDataUpdate);

    //     // Cleanup listener
    //     return () => {
    //         socket.off('data-update', handleDataUpdate);
    //     };
    // }, []); // Runs once when the component is mounted
    // useEffect(() => {
    //     // WebSocket logic for real-time updates
    //     socket.on('data-update', (newProduct) => {
    //         console.log("New product-------",newProduct);
    //         setProducts((prevProducts) => [...prevProducts, newProduct]); // This will correctly update the state
    //     });

    //     // Cleanup the WebSocket listener on unmount
    //     return () => {
    //         socket.off('data-update');
    //     };
    // }, []); // Empty dependency array means this effect runs once on mount



    useEffect(() => {
        socket.on('data-update', (data) => {
            console.log("Received Data:", data);

            if (data.storedProduct) {
                setProducts((prevProducts) => {
                    const newProducts = [...prevProducts];
                    const existingIndex = newProducts.findIndex(p => p.ASIN === data.storedProduct.ASIN || p.item_name === data.storedProduct.item_name);

                    if (existingIndex !== -1) {
                        // Update existing product with new googleProducts
                        newProducts[existingIndex] = {
                            ...newProducts[existingIndex],
                            googleProducts: data.googleProducts
                        };
                    } else {
                        // Add new product
                        newProducts.push({
                            ...data.storedProduct,
                            googleProducts: data.googleProducts
                        });
                    }

                    return newProducts;
                });
            }
        });



        // Cleanup the WebSocket listener on unmount
        return () => {
            socket.off('data-update');
        };
    }, []); // Empty dependency array means this effect runs once on mount

    useEffect(() => {
        console.log('ProductList component mounted');
    }, []);



    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token'); // retrieve from storage
                const response = await fetch(`http://localhost:3000/api/products?keyword=${encodeURIComponent(keyword)}`,{
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });;
                if (!response.ok) throw new Error('Network response was not ok');
                const data: Product[] = await response.json();

                setProducts(data);
                setCurrentProducts(data);

            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        if (keyword) {
            fetchProducts();
        }
    }, [keyword]); // Runs when `keyword` changes 

    // Apply filters to the current products
    const applyFilters = () => {
        let filteredProducts = products;

        // Filter by rating
        if (selectedRating) {
            filteredProducts = filteredProducts.filter(product => product.Rating === parseFloat(selectedRating));
        }

        // Filter by number sold
        if (selectedSoldCount) {
            const soldThreshold = parseInt(selectedSoldCount, 10);
            filteredProducts = filteredProducts.filter(product => product.Item_Sold >= soldThreshold);
        }

        // Filter by BSR Classification
        if (selectedBSRClass) {
            const [minBSR, maxBSR] = selectedBSRClass.split('-').map(Number);
            filteredProducts = filteredProducts.filter(product => product.BSR >= minBSR && product.BSR <= (maxBSR || Infinity));
        }

        setCurrentProducts(filteredProducts);
        setCurrentPage(1); // Reset to first page
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedRating('');
        setSelectedSoldCount('');
        setSelectedBSRClass('');
        setCurrentProducts(products);
        setCurrentPage(1);
    };

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const totalPages = Math.ceil(currentProducts.length / productsPerPage);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Get pagination buttons
    const getPaginationItems = () => {
        const items = [];
        const range = 2; // Number of page buttons to show on each side of current page

        // Previous button
        if (currentPage > 1) items.push(<button key="prev" onClick={() => paginate(currentPage - 1)} className="nav-button">Previous</button>);

        // First page
        items.push(<button key={1} onClick={() => paginate(1)} className={`page-button ${currentPage === 1 ? 'active' : ''}`}>1</button>);

        // Ellipsis
        if (currentPage > range + 1) items.push(<span key="ellipsis1" className="ellipsis">...</span>);

        // Current and surrounding pages
        for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
            items.push(
                <button key={i} onClick={() => paginate(i)} className={`page-button ${currentPage === i ? 'active' : ''}`} >
                    {i}
                </button>
            );
        }

        // Ellipsis
        if (currentPage < totalPages - range - 1) items.push(<span key="ellipsis2" className="ellipsis">...</span>);

        // Last page
        if (totalPages > 1) items.push(<button key={totalPages} onClick={() => paginate(totalPages)} className={`page-button ${currentPage === totalPages ? 'active' : ''}`}>{totalPages}</button>);

        // Next button
        if (currentPage < totalPages) items.push(<button key="next" onClick={() => paginate(currentPage + 1)} className="nav-button">Next</button>);

        return items;
    };

    return (
        <div className="product-list-container">
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
                <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontSize:'4em', fontFamily:'Georgia' }}>Product List</h1>

                {/* Main Product List */}
                <div>
                    {products
                        .filter((product) => product.ASIN)
                        .map((product, index) => (
                            <div key={product._id || index} className="product-container">
                                {/* Amazon Product */}
                                <div className="amazon-product">
                                    <h3>{product.item_name}</h3>
                                    {product.images.length > 0 && (
                                        <img src={product.images[0].link} alt={product.images[0].variant} />
                                    )}
                                    <p><strong>ASIN:</strong> {product.ASIN || 'N/A'}</p>
                                    <p><strong>Brand: </strong> {product.brand}</p>
                                    <h4><strong>Price:</strong> {product.price?.currency} {product.price?.value?.toFixed(2) || 'N/A'}</h4>
                                    <a href={product.URL} target="_blank" rel="noopener noreferrer">View Product</a>
                                    <ProductDetailsButton asin={product.ASIN} />
                                </div>

                                {/* Google Similar Products */}
                                <div className="google-products">
                                    <h4>Similar Products</h4>
                                    {product.googleProducts && product.googleProducts.length > 0 ? (
                                        product.googleProducts.map((gProduct, idx) => (
                                            <div key={idx} className="google-product-item">
                                                {/* Heading and similarity index */}
                                                <div className="google-product-header">
                                                    <h4>{gProduct.title}</h4>
                                                    <span className="similarity-index">{gProduct.image_similarity || 'N/A'}%</span>
                                                </div>

                                                {/* Stores */}
                                                <div className="stores-container">
                                                    {gProduct.stores?.length > 0 ? (
                                                        gProduct.stores.map((store, idx) => (
                                                            <div key={idx} className="store-card">
                                                                <h5><strong>Price:</strong> {store.price || 'N/A'}</h5>
                                                                <p><strong>Store:</strong> {store.storeName || 'Unknown Store'}</p>
                                                                <p><strong>Delivery Fee:</strong> {store.deliveryPrice || 'Unknown Store'}</p>
                                                                <div className="profit-container">
                                                                    <div className="profit-value" data-tooltip={`Referral Fee: ${store.ReferalFee || 'calculating'}  FBA Fee: ${store.fbaFee || 'calculating'}`}>
                                                                        <strong>Profit:</strong> {store.profit || 'calculating'}
                                                                    </div>
                                                                </div>
                                                                <a href={store.link || gProduct.link} target="_blank" rel="noopener noreferrer">View Product</a>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p style={{ fontSize: '14px', color: '#999' }}>No stores available.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-products-container">
                                            <p>No similar products available.</p>
                                            <div className="amazon-loader-container">
                                                <div className="amazon-loader">
                                                    <div className="amazon-loader-ring"></div>
                                                    <div className="amazon-loader-ring amazon-loader-ring-2"></div>
                                                    <div className="amazon-loader-ring amazon-loader-ring-3"></div>
                                                </div>
                                            </div>
                                        </div>


                                    )}
                                </div>
                            </div>
                        ))
                    }

                </div>
                <LoadingOverlay isLoading={isLoading} />
            </div>






            {/* <h1>Products</h1>
            <div className="filter-container">
                <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                    <option value="">Select Rating</option>
                    <option value="5">5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Star</option>
                    <option value="">No Filter</option>
                </select>

                <select value={selectedSoldCount} onChange={(e) => setSelectedSoldCount(e.target.value)}>
                    <option value="">Items Sold Filter</option>
                    <option value="1">1+</option>
                    <option value="100">100+</option>
                    <option value="1000">1000+</option>
                    <option value="10000">10k+</option>
                    <option value="20000">20k+</option>
                    <option value="">No Filter</option>
                </select>

                <select value={selectedBSRClass} onChange={(e) => setSelectedBSRClass(e.target.value)}>
                    <option value="">Select BSR</option>
                    <option value="1-10">1-10</option>
                    <option value="11-100">11-100</option>
                    <option value="101-1000">101-1000</option>
                    <option value="1001-10000">1001-10000</option>
                    <option value="10001-20000">10001-20000</option>
                    <option value="">No Filter</option>
                </select>

                <button onClick={applyFilters}>Apply Filters</button>
                <button onClick={clearFilters}>Clear Filters</button>
            </div>

            <div className="product-list">
                {
                    currentProducts
                        .map(product => (
                            <div key={product._id} className="product-card">
                                {product.images.length > 0 && (
                                    <div
                                        style={{
                                            overflow: 'hidden',
                                            width: '200px',
                                            height: '200px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: '10px auto'
                                        }}
                                    >
                                        <img
                                            src={product.images[0].link}
                                            alt={product.images[0].variant}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                )}
                                <h3 className="product-name">{product.item_name}</h3>
                                <p>Rating: {product.Rating} ({product.Rating} ratings)</p>
                                <p>Reviews: {product.Reviews} ({product.Reviews} reviews)</p>
                                <p>Price: <span className="discount-price">${product.price.value}</span></p>
                                <p>Items Sold: {product.Item_Sold}</p>
                                <p>BSR: {product.BSR}</p>
                                <a href={product.link} target="_blank" rel="noopener noreferrer" className="view-button">View Product</a>
                            </div>
                        ))
               }
            </div>

            <div className="pagination">
                {getPaginationItems()}
            </div> */}
        </div>
    );
};

export default ProductList;