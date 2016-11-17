require 'csv'

task :history_orders => :environment do
  CSV.foreach('data/historicos.csv', :headers => true, :col_sep => ';') do |row|
    year = row['Fecha'].slice(0, 4)
    month = row['Fecha'].slice(4,2)
    day = row['Fecha'].slice(6,2)
    #Ver si nos pueden mandar un 0 cuando la hora es menor a 10
    if row['Hora'].length == 3
        hour = row['Hora'].slice(0,1)
        minute = row['Hora'].slice(1,2)
    else
        hour = row['Hora'].slice(0,2)
        minute = row['Hora'].slice(2,2)
    end
    date_time = DateTime.parse(year + '-' + month + '-' + day + ' ' + hour + ':' + minute)
    order_id = row['Documento']
    client_id = row['Cliente']
    #client_name = row['Nombre']
    user = row['Usuario']
    action = row['Accion']
    status = row['Estado']

    client = Client.where(cr: client_id).first
    if Order.exists?(cr: order_id)
        order = Order.where(cr: order_id).first
    else
        order = Order.new(cr: order_id, created: date_time, client_id: client.id)
        order.save!
    end
    order_summary = OrderSummary.new(event: date_time, action: action, user: user, status: status, client_id: client.id, order_id: order.id)
    order_summary.save!
  end
end
