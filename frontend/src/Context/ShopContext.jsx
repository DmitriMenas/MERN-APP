import React, { createContext, useEffect } from "react";
import { useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i <= 300; i++) {
        cart[i] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {

    const [all_product, setAllProduct] = useState([]);
    const [cartItem, setCartItem] = useState(getDefaultCart());

    useEffect(() => {
        fetch("http://localhost:4000/allproducts")
            .then((res) => res.json())
            .then((data) => {
                setAllProduct(data);
            });

        if(localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/getcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: '',
            }).then((res) => res.json()).then((data) => {
                setCartItem(data);
            });
        }
    }, []);
   

    const addToCart = (itemId) => {
        setCartItem(prev => {
            const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
            updateCartOnServer(itemId, updatedCart[itemId]);
            return updatedCart;
        });
    };

    const removeFromCart = (itemId) => {
        setCartItem((prev) => ({...prev, [itemId]:prev[itemId] - 1}));
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/removecart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ itemId })
            })
            .then(response => response.json())
            .then(data => console.log('Server response:', data))
            .catch(error => console.error('Error removing cart item on server:', error));
        }
    };

    const updateCartOnServer = (itemId, quantity) => {
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/addcart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ itemId, quantity })
            })
            .then(response => response.json())
            .then(data => console.log('Server response:', data))
            .catch(error => console.error('Error updating cart on server:', error));
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItem) {
            if (cartItem[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItem[item];
                }
            }
        }
        return totalAmount;
    };
    
    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItem) {
            if (cartItem[item] > 0) {
                totalItem += cartItem[item];
            }
        }
        return totalItem;
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItem,
        addToCart,
        removeFromCart
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
