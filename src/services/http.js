import axios from 'axios'
import querystring from 'querystring'
import config from '../config'

// 错误提示
const networkErr = '网络请求超时'

let instance = axios.create({
  timeout: 15 * 1000, // 请求超时时间设置 15s
  withCredentials: false //  带cookie请求
  // headers: { 'Content-Type': 'application/html;charset=UTF-8' }
})

// request 拦截器
instance.interceptors.request.use(
  config => {
    return config
  },
  err => {
    return Promise.reject(err)
  }
)
// response 拦截器
instance.interceptors.response.use(
  res => {
    if (res.status === 200) {
      if (res.data.code === '10004') {
        // 超时
      }
    }
    return res
  },
  err => {
    if (err.response) {
      if (err.response.status === 401) {
        // 401
      }
      return Promise.reject(err.response.data || networkErr)
    }
    return Promise.reject(networkErr)
  }
)

const http = {
  formatData: (code, res) => {
    return new Promise((resolve, reject) => {
      if (res.status === 200) {
        let data = res.data

        return resolve(data)
      } else {
        return reject(res.statusText)
      }
    })
  },

  get: (path, params, { url = '', port = 8080, code = false }) => {
    return new Promise((resolve, reject) => {
      let apiUrl = `${config.apiUrl}:${port}/${path}`
      let headers = {
        'Content-Type': 'application/xml;charset=UTF-8'
      }
      if (url) {
        apiUrl = `${url}:${port}/${path}`
      }
      instance
        .get(apiUrl, {
          params,
          headers
        })
        .then(
          res => {
            http.formatData(code, res).then(resolve, reject)
          },
          err => {
            return reject(err || networkErr)
          }
        )
    })
  },
  post: (
    path,
    params,
    { url = '', port = 8810, code = false, raw = false, file = false }
  ) => {
    return new Promise((resolve, reject) => {
      let data = params
      let headers = {
        'Content-Type': 'application/json;charset=UTF-8'
      }
      if (file) {
        headers['Content-type'] = 'multipart/form-data'
      } else if (!raw) {
        data = querystring.stringify(params)
        headers['Content-type'] = 'application/x-www-form-urlencoded'
      }

      let apiUrl = `${config.apiUrl}:${port}/${path}`
      if (url) {
        apiUrl = `${url}:${port}/${path}`
      }
      // 拦截JSON对象里面的rel【权限控制】
      if (raw) {
        if (data.rel) {
          apiUrl += `?rel=${data.rel}`
          delete data.rel
        }
      }
      instance
        .post(apiUrl, data, {
          headers
        })
        .then(
          res => {
            http.formatData(code, res).then(resolve, reject)
          },
          err => {
            return reject(err.msg || networkErr)
          }
        )
    })
  }
}

export default http
