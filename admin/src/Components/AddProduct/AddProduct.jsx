import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        id: '',
        name: '',
        image: '',
        category: 'women',
        new_price: '',
        old_price: '',
        available: true,
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        
    
        setProductDetails(prevDetails => {
            const updatedDetails = { ...prevDetails, [name]: value };
            return updatedDetails;
        });
    };

    const addProduct = async () => {
        console.log(productDetails);
        let responseData;
        let product = productDetails;

        const formData = new FormData();
        formData.append('product', image);

        await fetch('http://localhost:4000/upload', {
            method: 'POST',
            headers: {
                accept: 'application/json',
            },
            body: formData,
        }).then((resp) => resp.json()).then((data) => {responseData = data});

        if(responseData.success){
            product.image = responseData.image_url;
            console.log(product);
            await fetch('http://localhost:4000/addproduct', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            }).then((resp) => resp.json()).then((data) => {
                data.success ? alert('Product added successfully') : alert('Failed to add product');
            });
        }
    };

  return (
    <div className='add-product'>
        <div className="addproduct-itemfield">
            <p>Product Title:</p>
            <input name="name" onChange={changeHandler} value={productDetails.name} type="text" placeholder="Enter product title"/>
        </div>
        <div className="addproduct-price">
            <div className="addproduct-itemfield">
                <p>Price:</p>
                <input onChange={changeHandler} value={productDetails.old_price} type="text" name='old_price' placeholder="Enter price"/>
            </div>
            <div className="addproduct-itemfield">
                <p>Offer Price:</p>
                <input onChange={changeHandler} value={productDetails.new_price} type="text" name='new_price' placeholder="Enter price"/>
            </div>
        </div>
        <div className="addproduct-itemfield">
            <p>Product Category</p>
            <select onChange={changeHandler} value={productDetails.category} name='category' className='add-product-selector'>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kid">Kids</option>
            </select>
        </div>
        <div className="addproduct-itemfield">
            <label htmlFor="file-input">
                <img src={image?URL.createObjectURL(image):upload_area} alt='' className='addproduct-thumbnail-img' />
            </label>
            <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
        </div>
        <button onClick={()=>{addProduct()}} className="addproduct-button">
            Add Product
        </button>
    </div>
  )
}

export default AddProduct