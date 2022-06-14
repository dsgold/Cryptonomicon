<template>
<!--  <modal-coins-list-->
<!--      v-if="isModalOpen"-->
<!--      :coin-list=this.coinList-->
<!--      @close-modal="isModalOpen = !isModalOpen"-->
<!--      @add-coin-from-list="quickPick"-->
<!--  />-->
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-300"
        >Тикер
        </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
              v-model="ticker"
              @keydown.enter="add"
              type="text"
              name="wallet"
              id="wallet"
              class="block w-full bg-pink-300 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Например DOGE"
          />
        </div>
        <div
            class="flex bg-pink-500 shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
              v-for="coin in quickPicks"
              :key="coin"
              @click="quickPick(coin)"
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-pink-300 text-gray-800 cursor-pointer"
          >
            {{ coin }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="isUniqueTicker" class="text-sm text-purple-300">
      Такой тикер уже добавлен
    </div>
    <div v-if="isValidTicker" class="text-sm text-red-200">
      Такой валюты нет
    </div>
<!--    <div-->
<!--        @click="isModalOpen = !isModalOpen"-->
<!--        class="inline-block items-center py-2 px-4 my-4 h cursor-pointer border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">-->
<!--      Список криптовалют-->
<!--    </div>-->
    <div></div>
    <add-button
        @click="add"
        class="my-4"/>
  </section>
</template>

<script>

import AddButton from '@/components/AddButton';
import {getCoinList} from "@/api";

export default {
  name: "AddTicker",
  components: {
    AddButton,
  },
  props: {
    tickers: {
      type: Array,
      required: true,
      default: Array,
    }
  },
  emits: {
    "is-coinList-loaded": null,
    "add-ticker": ticker => typeof ticker === 'string' && ticker.length,
  },
  data() {
    return {
      ticker: '',
      coinList: [],
      quickPicks: ["BTC", "DOGE", "BCH", "ETH"],
    }
  },
  created() {
    this.getCoins();
  },
  methods: {
    quickPick(coin) {
      this.ticker = coin;
      this.add();
    },
    add() {
      if (!this.isUniqueTicker && !this.isValidTicker && this.ticker.length) {
        this.$emit("add-ticker", this.upperTicker)
        this.ticker = "";
      }
    },
    async getCoins() {
      const coinList = await getCoinList();
      this.coinList = Object.keys(coinList.Data);
    },
  },

  computed: {
    isUniqueTicker() {
      if (this.ticker.length > 1) {
        return this.tickers.find((t) => t.name === this.upperTicker)
      }
      return false;
    },
    isValidTicker() {
      if (this.ticker.length > 1) {
        return !this.coinList.find((t) => t === this.upperTicker);
      }
      return false;
    },
    upperTicker() {
      return this.ticker.toUpperCase()
    }
  },
  watch: {
    coinList() {
      this.$emit('is-coinList-loaded')
    },
    ticker() {
      this.ticker.length ?
          this.quickPicks = Object.values(this.coinList)
              .filter(el => el.includes(this.upperTicker))
              .sort()
              .slice(0, 4)
          : this.quickPicks = ["BTC", "DOGE", "BCH", "CHD"]
    }
  }
}
</script>

<style scoped>

</style>