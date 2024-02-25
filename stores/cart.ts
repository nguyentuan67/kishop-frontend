import { defineStore } from "pinia";
import { IResponse, ProductDetail, ProductDetailV1 } from "~/types/index";
import { useLocalStorage } from "@vueuse/core"


export type cartType = {
  listProductDetail: ProductDetail[] | [],
  productsInCart: ProductDetailV1[] | []
};
const isAuthUser = false;

export const useCartStore = defineStore({
  id: "cartStore",
  state: () => ({
    listProductDetail: [],
    productsInCart: []
  } as cartType ),
  getters: {
    countProducts: (state) => {
      if (state.productsInCart.length > 0) {
        const totalProducts = state.productsInCart.reduce((total, currentProduct) => {
          return total + currentProduct.quantityOrder;
        }, 0);
        return totalProducts;
      } else {
        return 0;
      }
    }
  },
  actions: {
    async getProductsInCart() {
      if (isAuthUser) {
        //
      } else {
        this.productsInCart = useLocalStorage<ProductDetailV1[]>("cart_order", []).value;
        if (this.productsInCart.length > 0) {
          const response:IResponse<ProductDetail[]> = await $fetch("order/products-info", {
            method: 'POST',
            body: this.productsInCart
          });
          this.listProductDetail = response.output
        }
      }
    },
    addProductToCart(qtyId: number) {
      let productIsExist = false;
      for(let i=0; i<this.listProductDetail.length; i++) {
        if (this.listProductDetail[i].quantityId == qtyId) {
          this.listProductDetail[i].quantityOrder++;
          productIsExist = true;
          break;
        }
        if (!productIsExist) {
          
        }
      }
    },
    async updateDateQuantyProduct(qtyId: number, quantity: number) {
      if (isAuthUser) {
        //call api
      } else {
        const response:IResponse<ProductDetailV1> = await $fetch("order/products-info/v1", {
          method: 'POST',
          body: {
            quantityId: qtyId,
            quantityOrder: quantity
          }
        });
        for(let i=0; i<this.listProductDetail.length; i++) {
          let product = this.listProductDetail[i];
          if (product.quantityId == response.output.quantityId) {
            product.quantityOrder = response.output.quantityOrder;
            product.totalPrice = response.output.totalPrice;
            product.totalOldPrice = response.output.totalPrice;
            break;
          }
        };
        for (let i = 0; i < this.productsInCart.length; i++) {
          const product = this.productsInCart[i];
          if (product.quantityId == response.output.quantityId) {
            product.quantityOrder = response.output.quantityOrder;
          }
        }
        this.saveToLocalStorage();
      }
    },
    async removeProductInCart(qtyId: number) {
      
    },
    saveToLocalStorage() {
      localStorage.setItem("cart_order", JSON.stringify(this.productsInCart))
    },
  }
})