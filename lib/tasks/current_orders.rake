require 'csv'

task :current_orders => :environment do
  CSV.foreach('data/current_orders.csv', :headers => true, :col_sep => ';') do |row|

    #Obtención de info de los pedidos
    order_id = row['IdPedido']
    client_id = row['IdCliente']
    branch_id = row['IdSucursal']
    year = row['Fecha'].slice(0, 4)
    month = row['Fecha'].slice(4,2)
    day = row['Fecha'].slice(6,2)
    date_time = DateTime.parse(year + '-' + month + '-' + day)

    #Procesamiento de los pedidos
    client = Client.where(cr: client_id, branch_cr: branch_id).first
    if !client.nil?
      if Order.exists?(cr: order_id)
          order = Order.where(cr: order_id).first
      else
          order = Order.new(cr: order_id, created: date_time, client_id: client.id)
          order.save!
      end
    else
      puts 'COD_01: CLIENT WITH ID:' + client_id + 'NOT FOUND'
    end
    #Cambiar status
    order_summary = OrderSummary.new(event: date_time, action: 'CREATE_ORDER', user: 'SYSTEM', status: 0, client_id: client.id, order_id: order.id)
    order_summary.save!
  end
end
