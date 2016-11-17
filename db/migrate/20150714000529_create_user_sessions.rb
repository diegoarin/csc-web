class CreateUserSessions < ActiveRecord::Migration
  def change
    create_table :user_sessions do |t|
    	t.string :session_id, null: false, index: true
        t.text :data

        t.timestamps null: false
    end
  end
end
