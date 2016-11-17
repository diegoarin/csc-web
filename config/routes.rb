Rails.application.routes.draw do
  resources :users, except: [:new]
  resources :dispatchers, except: [:new]
  resources :clients, except: [:new]
  resources :user_sessions, only: [:create, :destroy]
  resources :password_resets, only: [:create, :update]
  resources :order_summaries, only: [:index]
  resources :routes, except: [:new]
  resources :route_clients, except: [:new]
  resources :route_summaries, only: [:index]
  get 'user_logged', to: 'users#user_logged'
  get 'index_by_route/:route_id', to: 'route_clients#index_by_route'
  get 'index_pending', to: 'orders#index_pending'
  get 'index_with_clients/:route_id', to: 'route_clients#index_with_clients', :defaults => { :format => 'json' }
  get 'index_by_order/:order_id', to: 'order_summaries#index_by_order'
  get 'index_filtered_order', to: 'orders#index_filtered_order'
  patch 'set_dispatcher_location/:route_id', to: 'routes#set_dispatcher_location'
  get 'get_dispatcher_location/:route_id', to: 'routes#get_dispatcher_location'
  get 'index_by_device_id_with_clients/:device_id', to: 'route_clients#index_by_device_id_with_clients'
  patch 'update_route_client_status/:route_id/:client_id', to: 'route_clients#update_route_client_status'
  post 'start_route/:route_id', to: 'routes#start_route'
  patch 'end_route/:route_id', to: 'routes#end_route'
  get 'current_routes', to: 'routes#current_routes'
  get 'history_routes', to: 'routes#history_routes'
  get 'route_summary/:route_id', to: 'route_summaries#route_summary'
  get 'orders/index_to_validate_by_client_qr/:qr', to: 'orders#index_to_validate_by_client_qr'
  get 'orders/get_orders_by_qr_dispatcher/:qr/:route_client_id', to: 'orders#get_orders_by_qr_dispatcher'
  post 'orders/validates', to: 'orders#validates'
  post 'orders/validate_orders/:route_client_id', to: 'orders#validate_orders'
  get 'report_daily_routes', to: 'routes#report_daily_routes'
  get 'report_daily_orders', to: 'orders#report_daily_orders'
  post 'report_deliver_avg', to: 'route_clients#report_deliver_avg'
  get 'report_daily_top_10_dispatchers', to: 'routes#report_daily_top_10_dispatchers'
  get 'report_daily_top_10_clients', to: 'routes#report_daily_top_10_clients'
  get 'report_daily_top_10_clients_delay', to: 'route_clients#report_daily_top_10_clients_delay'
  get 'report_daily_top_hour_delivered', to: 'orders#report_daily_top_hour_delivered'
  get 'report_daily_rutes_delay', to: 'routes#report_daily_rutes_delay'
  post 'report_client_order_quantity', to: 'route_clients#report_client_order_quantity'
  post 'report_dispatchers_deliver_avg', to: 'dispatchers#report_dispatchers_deliver_avg'
  post 'report_orders_delivered', to: 'orders#report_orders_delivered'
  post 'report_routes_finished', to: 'routes#report_routes_finished'
  post 'report_not_delivered_clients_quantity_by_date', to: 'orders#report_not_delivered_clients_quantity_by_date'
end
