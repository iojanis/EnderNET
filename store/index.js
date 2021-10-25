/* eslint-disable no-console */
export default {
  state() {
    return {
      isConnected: false, // Socket-Connection-Status
      isOnline: false, // Game-Connection-Status
      isLoaded: false,
      username: null,
      token: null,
      bountyStatus: null,
      message: null,
      UserDrawer: false,
      NotificationDrawer: false,
      Overlay: false,
      Crashed: false,
      onlinePlayers: [],
      latestMessages: [],
      currentItems: [],
      currentMarketItems: [],
      currentMarketItemStats: [],
      currentExp: 0
    }
  },
  mutations: {
    USER_DRAWER(state, status) {
      state.UserDrawer = status
    },
    NOTIFICATION_DRAWER(state, status) {
      state.NotificationDrawer = status
    },
    OVERLAY(state, status) {
      state.Overlay = status
    },
    SOCKET_CONNECT(state, status) {
      state.isConnected = true
      state.Crashed = false
      if (state.token && state.username) {
        this._vm.$socket.emit('auth', {
          token: state.token,
          user: state.username
        })
      }
      console.log('[S]: Client connected anonymously to Socket-Server')
    },
    SOCKET_DISCONNECT(state, status) {
      state.isConnected = false
      state.Crashed = true
      console.log('[S]: Client disconnected from Socket-Server')
    },
    SOCKET_MESSAGE(state, message) {
      state.message = message
      console.log('[S]: Generic-Message: ' + message)
    },
    SOCKET_CHAT_MESSAGE(state, message) {
      state.latestMessages.unshift(message)
      console.log('[S]: New Chat-Message: ' + message)
    },
    SOCKET_PLAYER_JOINED(state, player) {
      state.onlinePlayers.push(player)
      if (state.username === player) {
        state.isOnline = true
      }
      console.log('[S]: Player joined the game: ' + player)
    },
    SOCKET_PLAYER_LEFT(state, player) {
      const index = state.onlinePlayers.indexOf(player)
      if (index > -1) {
        state.onlinePlayers.splice(index, 1)
      }
      if (player === state.username) state.isOnline = false
      console.log('[S]: Player left the game: ' + player)
    },
    SOCKET_INIT_CHAT(state, event) {
      state.onlinePlayers = event.online
      state.latestMessages = event.latest
      console.log('[S]: Chat-initialized')
    },
    SOCKET_INIT_USER(state, event) {
      state.isOnline = event.isOnline
      state.username = event.username
      state.bountyStatus = event.bountyStatus
      console.log('[S]: User-initialized')
    },
    SOCKET_INIT_XP(state, event) {
      state.currentExp = event.exp
      console.log('[S]: EXP-initialized')
    },
    SOCKET_INIT_STOCK(state, items) {
      state.currentItems = items
      console.log('[S]: Items-initialized')
    },
    SOCKET_INIT_MARKET(state, items) {
      state.currentMarketItems = items
      console.log('[S]: Market-Items-initialized')
    },
    SOCKET_RECEIVE_MARKET_ITEM_STATS(state, items) {
      for (const item in items) {
        this.dataset.push(item.value)
        this.labels.xLabels.push(item.createdAt)
      }
      state.currentMarketItemStats = items
    },
    SOCKET_ITEM_UPDATED(state, updatedItem) {
      console.log(JSON.stringify(updatedItem))
      console.log('[S]: Stock-Item updated: ')
      for (let i = 0; i < state.currentItems.length; i++) {
        // eslint-disable-next-line eqeqeq
        if (state.currentItems[i].item == updatedItem.item) {
          // eslint-disable-next-line no-unused-expressions
          state.currentItems[i].amount = updatedItem.amount
          state.currentItems[i].market = updatedItem.market
        }
      }
    },
    SOCKET_MARKET_ITEM_UPDATED(state, updatedItem) {
      console.log('[S]: Market-Item updated: ' + updatedItem.toString())
      let done = false
      for (let i = 0; i < state.currentMarketItems.length; i++) {
        // eslint-disable-next-line eqeqeq
        if (state.currentMarketItems[i].item === updatedItem.item && state.currentMarketItems[i].username === updatedItem.username) {
          if (!updatedItem.market) {
            state.currentMarketItems.splice(i, 1)
            return
          }
          // eslint-disable-next-line no-unused-expressions
          state.currentMarketItems[i].amount = updatedItem.amount
          state.currentMarketItems[i].price = updatedItem.price
          state.currentMarketItems[i].market = updatedItem.market
          done = true
          return
        }
      }
      if (!done) {
        state.currentMarketItems.push(updatedItem)
      }
    },
    SOCKET_UPDATE_XP(state, event) {
      this.state.currentExp = event.xp
      console.log('[S]: XP-updated to: ' + event.xp)
    },
    GET_STOCK_ITEMS(state, mode) {
      this._vm.$socket.emit('get_stock_items', mode)
    },
    GET_MARKET_ITEMS(state, mode) {
      this._vm.$socket.emit('get_market_items', mode)
    },
    DOWNLOAD_EXP(state) {
      this._vm.$socket.emit('download_exp')
    },
    UPLOAD_EXP(state) {
      this._vm.$socket.emit('upload_exp')
    },
    TRANSFER_EXP(state, receiver, amount) {
      this._vm.$socket.emit('transfer_exp', receiver, amount)
    },
    DOWNLOAD_STOCK_ITEM(state, item, rate) {
      this._vm.$socket.emit('download_stock_item', { item: item, rate: rate })
    },
    UPLOAD_STOCK_ITEM(state, item, rate) {
      this._vm.$socket.emit('upload_stock_item', { item: item, rate: rate })
    },
    SET_MARKET_ITEM(state, item, price) {
      this._vm.$socket.emit('set_market_item', { item: item, price: price })
    },
    UNSET_MARKET_ITEM(state, item) {
      this._vm.$socket.emit('unset_market_item', { item: item })
    },
    BUY_MARKET_ITEM(state, item, amount, price) {
      console.log(item, amount, price)
      this._vm.$socket.emit('buy_market_item', { item: item, amount: amount, price: price })
    },
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  getters: {
    latestMessages: (state) => {
      return state.latestMessages
    },
    onlinePlayers: (state) => {
      return state.onlinePlayers
    },
    currentItems: (state) => {
      return state.currentItems
    },
    currentMarketItems: (state) => {
      return state.currentMarketItems
    },
    currentMarketItemStats: (state) => {
      return state.currentMarketItemStats
    },
    currentExp: (state) => {
      return state.currentExp.toFixed(2)
    },
    isCurrentlyOnline: (state) => {
      return state.isOnline
    }
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token)
    },
    toggleUserDrawer({ commit }, status) {
      commit('USER_DRAWER', status)
      commit('OVERLAY', true)
    },
    toggleNotificationDrawer({ commit }, status) {
      commit('NOTIFICATION_DRAWER', status)
      commit('OVERLAY', true)
    },
    toggleAll({ commit }, status) {
      commit('OVERLAY', status)
      commit('NOTIFICATION_DRAWER', status)
      commit('USER_DRAWER', status)
    },
    // Experience
    downloadExp({ commit }) {
      commit('DOWNLOAD_EXP')
    },
    uploadExp({ commit }) {
      commit('UPLOAD_EXP')
    },
    transferExp({ commit }, receiver, amount) {
      commit('TRANSFER_EXP', receiver, amount)
    },
    // Items
    getStockItems({ commit }, mode) {
      commit('GET_STOCK_ITEMS', mode)
    },
    downloadStockItem({ commit }, item, rate) {
      commit('DOWNLOAD_STOCK_ITEM', item, rate)
    },
    uploadStockItem({ commit }, item, rate) {
      commit('UPLOAD_STOCK_ITEM', item, rate)
    },
    // Items / Market
    getMarketItems({ commit }, mode) {
      commit('GET_MARKET_ITEMS', mode)
    },
    setMarketItem({ commit }, item, price) {
      commit('SET_MARKET_ITEM', item, price)
    },
    unsetMarketItem({ commit }, item) {
      commit('UNSET_MARKET_ITEM', item)
    },
    buyMarketItem({ commit }, item, amount, price) {
      console.log(item, amount, price)
      commit('BUY_MARKET_ITEM', item, amount, price)
    },
    buyItem({ commit }, options) {
      this._vm.$socket.emit('buy_market_item', options)
    },
    // User
    createUserAccount({ commit }, options) {
      this._vm.$socket.emit('create-user-account', options)
    }
  }
}