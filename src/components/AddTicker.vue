<template>
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
    <div v-if="checkUniq" class="text-sm text-purple-800">
      Такой тикер уже добавлен
    </div>
    <div v-if="checkValid" class="text-sm text-red-800">
      Такой валюты нет
    </div>
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
    "is-coinList-loaded": state => typeof state === 'boolean',
    "add-ticker": ticker => typeof ticker === 'string' && ticker.length,
  },
  data() {
    return {
      ticker: '',
      coinList: [],
      isUniq: false,
      isExist: false,
      quickPicks: ["BTC", "DOGE", "BCH", "ETH"]
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
        if (!this.checkUniq && !this.checkValid) {
          this.$emit("add-ticker", this.ticker.toUpperCase())
          this.ticker = "";
        }
    },
    async getCoins() {
      const coinList = await getCoinList();
      this.coinList = Object.keys(coinList.Data);
    },
  },

  computed: {
    checkUniq() {
      if (this.ticker.length) {
        return this.tickers.find((t) => t.name === this.ticker.toUpperCase())
      }
      return false;
    },
    checkValid() {
      if (this.ticker.length) {
        return !this.coinList.find((t) => t === this.ticker.toUpperCase());
      }
      return false;
    }
  },
  watch: {
    coinList() {
      this.$emit('is-coinList-loaded', true)
    },
    ticker() {
      this.ticker.length ?
          this.quickPicks = Object.values(this.coinList)
              .filter(el => el.includes(this.ticker.toUpperCase()))
              .sort()
              .slice(0, 4)
          : this.quickPicks = ["BTC", "DOGE", "BCH", "CHD"]
    }
  }
}
</script>

<style scoped>

</style>