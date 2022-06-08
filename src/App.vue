<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <load-spinner v-if="!isLoaded"/>
    <div class="container">
      <add-ticker
          :tickers=this.tickers
          @add-ticker="add"
          @is-coinList-loaded="this.isLoaded = true"/>
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4"/>
        <div class="flex">
          <div class="max-w-xs">
            <label for="filter" class="block text-sm font-medium text-gray-300">
              Фильтр:
            </label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                  v-model="filter"
                  class="block w-full bg-pink-300 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  type="text"
                  name="filter"
                  id="filter"
              />
            </div>
          </div>
          <div class="ml-auto">
            <button
                v-if="page > 1"
                @click="page--"
                class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Назад
            </button>
            <button
                v-if="hasNextPage"
                @click="page++"
                class="my-4 mx-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Вперед
            </button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-6"/>
        <dl class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
              v-for="item in paginatedTickers"
              :key="item"
              @click="select(item)"
              :class="{
              'bg-pink-800 text-white': selectedTicker === item,
              'bg-red-700' : item.price === '-',
              'bg-pink-300' : item.price !== '-'
            }"
              class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-black-500 truncate">
                {{ item.name.toUpperCase() }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-black-900">
                {{ formatPrice(item.price) }}
              </dd>
            </div>
            <remove-button @click.stop="handleDelete(item)"/>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-6"/>
      </template>
      <coin-graph
          v-if="selectedTicker"
          :graph="this.graph"
          :selected-ticker="this.selectedTicker.name"
          @graph-close="this.selectedTicker = null"
          @max-graph-elements="(el) => this.maxGraphSize = el"
      />
    </div>
  </div>
</template>

<script>

import {unsubscribeFromTicker, subscribeToTicker} from "@/api";
import AddTicker from "@/components/AddTicker";
import CoinGraph from "@/components/CoinGraph";
import LoadSpinner from "@/components/LoadSpinner";
import RemoveButton from "@/components/RemoveButton";

export default {
  name: "App",

  components: {
    RemoveButton,
    LoadSpinner,
    AddTicker,
    CoinGraph,
  },
  data() {
    return {
      filter: "",

      tickers: [],
      selectedTicker: null,

      graph: [],
      maxGraphSize: null,

      page: 1,

      itemsOnPage: 6,
      isLoaded: false,
    };
  },
  created() {
    const windowData = Object.fromEntries(
        new URL(window.location).searchParams.entries()
    );
    const VALID_KEYS = ['filter', 'page'];

    VALID_KEYS.forEach(key => {
      if (windowData[key]) {
        this.key = windowData[key];
      }
    })
    const tickersData = localStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, newPrice => {
          this.updateTicker(ticker.name, newPrice);
        });
      })
    }
  },


  methods: {
    resizeGraph() {
      if (this.graph.length > this.maxGraphSize) {
        this.graph = this.graph.slice(this.graph.length - this.maxGraphSize, this.graph.length)
      }
    },
    formatPrice(price) {
      if (price === '-') {
        return price
      }
      price = Number(price)
      return price > 1
          ? price.toFixed(2)
          : price.toPrecision(2);
    },
    updateTicker(tickerName, price) {
      this.tickers
          .filter(t => t.name === tickerName)
          .forEach(t => {
            if (t === this.selectedTicker && t.price !== '-') {
              this.graph.push(t.price)
              this.resizeGraph();
            }
            t.price = price;
          });
    },
    add(ticker) {
      const currentTicker = {
        name: ticker,
        price: "-"
      };
      this.tickers = [...this.tickers, currentTicker];
      this.filter = "";
      subscribeToTicker(currentTicker.name, newPrice =>
          this.updateTicker(currentTicker.name, newPrice)
      );
    },
    select(ticker) {
      this.selectedTicker = ticker;
      },
    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter(t => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
    },
  }
  ,
  computed: {

    startIndex() {
      return (this.page - 1) * this.itemsOnPage;
    }
    ,
    endIndex() {
      return this.page * this.itemsOnPage;
    }
    ,
    filteredTickers() {
      return this.tickers.filter(
          (ticker) => ticker.name.includes(
              this.filter.toUpperCase()
          ) || ticker === this.selectedTicker
      );
    }
    ,
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    }
    ,
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    }
    ,

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    }
  }
  ,
  watch: {
    maxGraphSize() {
      this.resizeGraph();
    }
    ,
    selectedTicker() {
      this.graph = [];
    }
    ,
    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    }
    ,
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page--;
      }
    }
    ,
    filter() {
      this.page = 1;
    }
    ,
    pageStateOptions(value) {
      window.history.pushState(
          null,
          document.title,
          `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  }
  ,
}
;
</script>
