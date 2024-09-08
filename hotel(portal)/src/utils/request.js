import axios from "axios";
import { Notification } from 'element-ui'
import router from '@/router'

//创建axios实例
const instance = axios.create({
    baseURL:"http://106.52.219.171:8188",
    // baseURL:"http://106.52.219.171:8105",
    // timeout:15000, 请求超时设置
})

//请求拦截
instance.interceptors.request.use(
    function (config) {
        if (localStorage.getItem('Token')) {
            config.headers.Authorization = localStorage.getItem('Token');
        } else if(/auth/.test(config.url)) { // 通过正则匹配请求url是否有auth，为true则不需要携带token
            return config
        } else{ // 请求为携带token，且不是非权限接口，则提示无法获取token
            console.log('token无法获取');
        }
        return config
    },
    function (err) {
        return Promise.reject(err)
    }
)

/**
 * 响应拦截
 *
 * //权限部分响应码
 * USER_LOGIN_SUCCESS("200","用户登录成功"),
 * USER_LOGOUT_SUCCESS("200","用户登出成功"),
 * USER_NO_ACCESS("4010","用户无权访问"),
 * NO_LOGIN("4011","用户未登录"),
 * USERNAME_PWD_ERROR("4012","用户名或密码错误"),
 * TOKEN_IS_BLACKLIST("4013","此token为黑名单"),
 * LOGIN_IS_OVERDUE("4014","登录已失效"),
 * ILLEGAL_TOKEN("4015","非法token"),
 * TOKEN_EXPIRED("4016","登录状态过期"),
 */
instance.interceptors.response.use(
    function (res) {
        const data = res.data
        //特殊情况处理
        switch (data.code) {
            case "4011":
            case "4013":
            case "4014":
            case "4015":
            case "4016":
                router.push('../login')
            case "4010":
            case "4012":
                Notification.error({
                    title: "提示信息",
                    message: data.msg,
                });
                break;
            default:
                break;
        }
        return res
    },
    function (err) {
        const data = err.response.data
        //特殊情况处理
        switch (data.code) {
            case "4011":
            case "4013":
            case "4014":
            case "4015":
            case "4016":
                router.push('../login')
            case "4010":
            case "4012":
                Notification.error({
                    title: "提示信息",
                    message: data.msg,
                });
                break;
            default:
                break;
        }
        return Promise.reject(err)
    }
)

//封装get请求
export function get(url,params) {
    return instance.get(url,{
        params
    })
}


//封装post请求
export function post(url,data,config) {
    return instance.post(url,data,config)
}

//post请求,Content-Type为application/x-www-form-urlencoded
export function formDataPost(url,data) {
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        transformRequest : [function (data) {
            let ret = ''
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        }]
    }
    return instance.post(url,data,config)
}

// export function postOnForm(url,data,config) {
//     instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
//     instance.defaults.transformRequest = [function (data) {
//         let ret = ''
//         for (let it in data) {
//             ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
//         }
//         return ret
//     }]
//     return instance.post(url,data,config)
// }