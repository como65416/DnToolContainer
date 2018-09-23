<template>
  <el-main style="padding: 10px; height: 100%;">
    <el-tabs
      type="border-card"
      style="height: 99%;"
      @tab-remove="closeTab"
      v-model="activity_tab_id">
      <el-tab-pane closable
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id">
        <span slot="label" class="success">{{ tab.name }}</span>
        <webview v-bind:src="tab.uri" style="width:100%;height:89%;border:none;" nodeintegration allowpopups></webview>
      </el-tab-pane>
    </el-tabs>
  </el-main>
</template>

<style scoped>
</style>

<script>
export default {
  data() {
    return {
      tabs: [],
      next_tab_id: 100,
      activity_tab_id: null,
      dialogTableVisible: false
    };
  },
  methods: {
    addTab: function (option) {
      for (let i in this.tabs) {
        if (this.tabs[i].option_id == option.id) {
          this.activity_tab_id = this.tabs[i].id
          return;
        }
      }
      console.log(option);
      let new_tab = {
        id: 'tab' + this.next_tab_id,
        name: option.name,
        uri: option.uri,
        option_id: option.id
      };
      console.log(new_tab);
      this.tabs.push(new_tab);
      this.activity_tab_id = 'tab' + this.next_tab_id;
      this.next_tab_id++;
    },
    closeTab: function (tab_id) {
      for (let i in this.tabs) {
        if (this.tabs[i].id == tab_id) {
          this.tabs.splice(i, 1);
          if (this.tabs[i] !== undefined) {
            this.activity_tab_id = this.tabs[i].id;
          } else if (this.tabs.length != 0) {
            this.activity_tab_id = this.tabs[this.tabs.length - 1].id;
          }
          break;
        }
      }
    }
  }
}
</script>
