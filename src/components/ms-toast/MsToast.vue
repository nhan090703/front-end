<template>
  <div class="ms-toast-wrapper">
    <div class="ms-toast" :class="`ms-toast--${type}`">
      <template v-if="type=='success'"><div class="icon-toast"></div></template>
      <template v-else ><div class="icon-danger"></div></template>
      <div class="toast-text">
        <slot></slot>
      </div>
      <div class="icon-close icon16" @click="$emit('close')"></div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error'].includes(value),
  },
})
const emit = defineEmits(['close'])
</script>
<style scoped>
.ms-toast-wrapper {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 0px;
  overflow: hidden;
  z-index: 1090;
  pointer-events: none;
}
.ms-toast {
  display: flex;
  align-items: center;
  box-shadow: 0 4px 16px #0000003d;
  width: min(100%, 420px);
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
  color: #fff;
  cursor: pointer;
  background-color: #12b76a;
  pointer-events: all;
  margin-top: 0;
}
.ms-toast--error {
  background-color: #f04438;
}
.ms-toast--success {
  background-color: #12b76a;
}
.toast-text {
  flex: 1;
  padding-right: 12px;
  font-size: 13px;
}
.icon-toast {
  height: 20px;
  width: 20px;
  min-width: 20px;
  margin: 1px 8px 0 16px;
  position: relative;
  -webkit-mask-image: url('https://demoqtsxcdn.misacdn.net/assets/pas.Sprites-a34588bd.svg?v=12.1.0.4');
  -webkit-mask-position: -98px -168px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
}
.icon-close {
  height: 20px;
  width: 20px;
  min-width: 20px;
  margin-right: 16px;
  cursor: pointer;
  background-color: #fff;
}
.icon-danger{
  -webkit-mask-image: url('https://demoqtsxcdn.misacdn.net/assets/pas.qtsx_icon-d81b89bb.svg?v=12.1.0.4');
  -webkit-mask-position: -249px -168px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
  width: 20px;
  height: 20px;
  margin: 1px 8px 0 16px;
}
</style>
