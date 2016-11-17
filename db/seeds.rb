# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

if User.count == 0
    puts "Creating Admin User"
    User.create({name:'Administrador', login:'admin', password:'admin', password_confirmation:'admin', email:'carrauInfo@gmail.com', admin:true, adm_users:true, adm_clients:true, adm_dispatchers:true, reports:true, queries:true})
    User.create({name:'Diego Arin', login:'darin', password:'darin', password_confirmation:'darin', email:'diegoarinc@gmail.com', admin:false, adm_users:false, adm_clients:false, adm_dispatchers:false, reports:true, queries:true})
    User.create({name:'Sebastian Sequeira', login:'ssequeira', password:'ssequeira', password_confirmation:'ssequeira', email:'sequeira.sebastian@gmail.com', admin:false, adm_users:true, adm_clients:true, adm_dispatchers:true, reports:false, queries:false})
end
if Dispatcher.count == 0
    puts "Creando transportistas de ejemplo"
    Dispatcher.create({name:'Diego Arin', phone:'098393471', device:'359308054736701', cr:1})
    Dispatcher.create({name:'Pedro Gómez', phone:'098393472', device:'359308054736702', cr:2})
    Dispatcher.create({name:'Rafael Rodríguez', phone:'098393473', device:'359308054736703', cr:3})
    Dispatcher.create({name:'Pablo Lopez', phone:'098393474', device:'359308054736704', cr:4})
    Dispatcher.create({name:'Gerardo Zifre', phone:'098393475', device:'359308054736705', cr:5})
    Dispatcher.create({name:'Juan Olmos', phone:'098393476', device:'359308054736706', cr:6})
    Dispatcher.create({name:'Miguel Mendieta', phone:'098393477', device:'359308054736707', cr:7})
    Dispatcher.create({name:'Raúl Gutierrez', phone:'098393478', device:'359308054736708', cr:8})
    Dispatcher.create({name:'Lisandro Fau', phone:'098393479', device:'359308054736709', cr:9})
    Dispatcher.create({name:'Julio Santana', phone:'098393480', device:'359308054736710', cr:10})
end
if Client.count == 0
    puts "Creando clientes de ejemplo"
    Client.create(business:'PROMOCIONES YERBA SARA', fantasy: 'PROMOCIONES YERBA SARA', rut:'200143190019', address: 'Ipiranga 3129', phone: '098456759', lat:-34.8538344, long:-56.1859325, branch_cr: 1, cr: 300056, qr:'Agd735jwHXJWQPti3J7Q')
    Client.create(business:'PINTURAS GRANITOL S.A.', fantasy: 'PINTURAS GRANITOL', rut:'200135357011', address: 'Libertad 2588', phone: '098456751', lat:-34.9101155, long:-56.1547349, branch_cr: 1, cr: 300650, qr:'Agd735jwHXJWQPti3J7N')
    Client.create(business:'CHATILLON S.A.', fantasy: 'CHATILLON', rut:'200347570021', address: 'Doctor Alejandro Gallinal 2092', phone: '098456368', lat:-34.8798865, long:-56.1034736, branch_cr: 1, cr: 301511, qr:'Agd735jwHXJWQPti3J7O')
    Client.create(business:'PROMOCIONES TE PRESIDENT', fantasy: 'PROMOCIONES TE PRESIDENT', rut:'200143670017', address: 'Guadalupe 1513', phone: '094568759', lat:-34.8783406, long:-56.1880078, branch_cr: 1, cr: 306855, qr:'Agd735jwHXJWQPti3J7P')
    Client.create(business:'DIAGEO URUGUAY S.A.', fantasy: 'DIAGEO', rut:'200146790012', address: 'Avenida Agraciada 2485', phone: '094568563', lat:-34.8863496, long:-56.1917902, branch_cr: 1, cr: 308745, qr:'Agd735jwHXJWQPti3J7M')
    Client.create(business:'PROMOCIONES MERISANT', fantasy: 'PROMOCIONES MERISANT', rut:'200147650012', address: 'Dionisio Fernández 123', phone: '096568463', lat:-34.8025552, long:-56.0895128, branch_cr: 1, cr: 300074, qr:'Agd735jwHXJWQPti3J7R')
    Client.create(business:'ATLANTIS S.A.', fantasy: 'ATLANTIS', rut:'200146790012', address: 'Leandro Gómez 3487', phone: '094565568', lat:-34.8367716, long:-56.1502209, branch_cr: 1, cr: 300421, qr:'Agd735jwHXJWQPti3J7S')
    Client.create(business:'OLGA GONZALEZ-LAVADERO CAIROLI', fantasy: 'LAVADERO CAIROLI', rut:'200124690012', address: 'Rincón 431', phone: '095568569', lat:-34.9071616, long:-56.208965, branch_cr: 1, cr: 300640, qr:'Agd735jwHXJWQPti3J7T')
    Client.create(business:'GANISOL S.A.', fantasy: 'GANISOL', rut:'200146790012', address: 'Ejido 432', phone: '093568789', lat:-34.9148916, long:-56.1880505, branch_cr: 1, cr: 303235, qr:'Agd735jwHXJWQPti3J7U')
    Client.create(business:'JULIO CESAR LESTIDO S.A.', fantasy: 'JULIO CESAR LESTIDO', rut:'200146790018', address: 'Carlos Berg 2475', phone: '091564763', lat:-34.9136196, long:-56.160546, branch_cr: 1, cr: 304660, qr:'Agd735jwHXJWQPti3J7V')
    Client.create(business:'LEDABAL S.A.', fantasy: 'LEDABAL', rut:'200146650011', address: 'General Flores 2542', phone: '094568547', lat:-34.8809546, long:-56.183984, branch_cr: 1, cr: 331255, qr:'Agd735jwHXJWQPti3J7W')
    Client.create(business:'CADIZ S.R.L.', fantasy: 'CADIZ', rut:'200142590017', address: 'Pablo Ehrlich 3929', phone: '098568598', lat:-34.8599206, long:-56.182931, branch_cr: 1, cr: 340013, qr:'Agd735jwHXJWQPti3J7X')
    Client.create(business:'LA AVENIDA S.R.L.', fantasy: 'LA AVENIDA', rut:'200123790014', address: 'General San Martín 4359', phone: '099568983', lat:-34.8419316, long:-56.171366, branch_cr: 1, cr: 340057, qr:'Agd735jwHXJWQPti3J7Y')
    Client.create(business:'FEROX S.R.L.', fantasy: 'FEROX', rut:'200146790012', address: 'Capri 2234', phone: '092568912', lat:-34.8701156, long:-56.067661, branch_cr: 1, cr: 341271, qr:'Agd735jwHXJWQPti3J7Z')
    Client.create(business:'LA TUNITA II S.R.L.', fantasy: 'LA TUNITA II', rut:'200146230013', address: 'Mantua 6868', phone: '091568579', lat:-34.8867066, long:-56.051121, branch_cr: 1, cr: 350084, qr:'Agd735jwHXJWQPti3J7A')
    Client.create(business:'SILPAS S.R.L.', fantasy: 'SILPAS', rut:'200146790018', address: 'Brenda 5888', phone: '092568590', lat:-34.8951056, long:-56.081968, branch_cr: 1, cr: 360047, qr:'Agd735jwHXJWQPti3J7B')
    Client.create(business:'KELMER S.A.', fantasy: 'KELMER', rut:'200148990019', address: 'Zum Felde 2323', phone: '093565863', lat:-34.8726466, long:-56.107725, branch_cr: 1, cr: 360074, qr:'Agd735jwHXJWQPti3J7C')
    Client.create(business:'MACROMERCADO MAYORISTAS S.A.', fantasy: 'MACROMERCADO', rut:'200112790012', address: 'Camino Maldonado 6783', phone: '096568532', lat:-34.8239819, long:-56.1043023, branch_cr: 1, cr: 900235, qr:'Agd735jwHXJWQPti3J7D')
    Client.create(business:'DEVOTO HNOS S.A.', fantasy: 'DEVOTO', rut:'200146780010', address: 'Vera 2828', phone: '094568525', lat:-34.8644906, long:-56.135107, branch_cr: 1, cr: 1704001, qr:'Agd735jwHXJWQPti3J7E')
    Client.create(business:'KAMOL S.A.', fantasy: 'KAMOL', rut:'200143680015', address: 'Camino Carlos A. López 7547', phone: '092545529', lat:-34.8095172, long:-56.1921673, branch_cr: 1, cr: 7695458, qr:'Agd735jwHXJWQPti3J7F')
    Client.create(business:'OBACOR S.A.', fantasy: 'OBACOR', rut:'200145480012', address: 'Camino Repetto 3943', phone: '091562575', lat:-34.816195, long:-56.134564, branch_cr: 1, cr: 7695449, qr:'Agd735jwHXJWQPti3J7G')
    Client.create(business:'RIMA LTDA.', fantasy: 'RIMA', rut:'200926780012', address: 'San Nicolas 1309', phone: '094534591', lat:-34.893980, long:-56.065983, branch_cr: 1, cr: 7695427, qr:'Agd735jwHXJWQPti3J7H')
    Client.create(business:'LIMAFOX S.A.', fantasy: 'LIMAFOX', rut:'200191780011', address: 'Doctor José María Penco 3285', phone: '098528584', lat:-34.867175, long:-56.178895, branch_cr: 1, cr: 7695409, qr:'Agd735jwHXJWQPti3J7I')
    Client.create(business:'SUAFIL S.A.', fantasy: 'SUAFIL', rut:'200128780010', address: 'Guardia Oriental 3220', phone: '099532685', lat:-34.867523, long:-56.188424, branch_cr: 1, cr: 7695397, qr:'Agd735jwHXJWQPti3J7J')
    Client.create(business:'MARBI LTDA.', fantasy: 'MARBI', rut:'200566780014', address: 'Avenida Italia 3189', phone: '093458581', lat:-34.888154, long:-56.1473712, branch_cr: 1, cr: 7695278, qr:'Agd735jwHXJWQPti3J7K')
end
