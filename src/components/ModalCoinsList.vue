<template>
  <div @keydown.esc = "this.$emit('close-modal')" tabindex="-1"
       class="fixed top-0 right-0 left-0 z-10 w-full md:inset-0 h-modal md:h-full" ref="modal-dialog">
    <div class="relative p-4 w-full max-w-full h-full md:h-auto">
      <!-- Modal content -->
      <div class="relative z-50 bg-white rounded-lg shadow dark:bg-pink-500">
        <!-- Modal header -->
        <div class="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
          <h3 class="text-xl font-medium text-gray-900 dark:text-white">
            Список доступных криптовалют
          </h3>
          <button @click="$emit('close-modal')"
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="extralarge-modal">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <!-- Modal body -->
        <div class="p-6 space-y-6 overflow-auto h-full">
          <!--          <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">-->
          <!--            With less than a month to go before the European Union enacts new consumer privacy laws for its citizens,-->
          <!--            companies around the world are updating their terms of service agreements to comply.-->
          <!--          </p>-->

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
              <div class="block text-sm font-medium text-gray-300">найдено: {{existsCoins}} шт</div>
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
          <dl class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-5 overflow-auto h-full">
            <div
                v-for="coin in paginatedTickers"
                :key="coin"
                @click="chooseCoin(coin)"
                class="bg-pink-300 overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            >
              <div class="px-4 py-5 sm:p-6 text-center">
                <dt class="text-xl font-medium text-black truncate">
                  {{ coin }}
                </dt>
              </div>
            </div>
          </dl>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalCoinsList",
  props: {
    coinList: {
      type: Array,
      required: true,
    }
  },
  emits: {
    'add-coin-from-list': coin => typeof coin === 'string',
    'close-modal': {},
  },
  data() {
    return {
      filter: '',
      page: 1,
      itemsOnPage: 30,
    }
  },
  mounted() {
    this.$refs["modal-dialog"].focus()
  },
  methods: {
    chooseCoin(coin) {
      this.$emit('add-coin-from-list', coin);
      this.$emit('close-modal')
    }
  },
  computed: {
    filteredCoinList() {
      return this.coinList.filter((coin) => coin.includes(this.filter.toUpperCase())).sort() || this.filter
    },
    startIndex() {
      return (this.page - 1) * this.itemsOnPage;
    }
    ,
    endIndex() {
      return this.page * this.itemsOnPage;
    },

    paginatedTickers() {
      return this.filteredCoinList.slice(this.startIndex, this.endIndex);
    }
    ,
    hasNextPage() {
      return this.filteredCoinList.length > this.endIndex;
    },
    existsCoins() {
      return this.filteredCoinList.length
    }
  }
}
</script>

<style scoped>

</style>