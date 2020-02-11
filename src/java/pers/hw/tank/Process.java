/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pers.hw.tank;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.Date;
import java.text.SimpleDateFormat;
import javax.swing.JFrame;

/**
 *
 * @author HW
 */
public class Process extends HttpServlet {

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String id = request.getParameter("id");
        response.setCharacterEncoding("utf8");
        String path = request.getSession().getServletContext().getRealPath("");
        switch (id) {
            case "start":
                File f = new File(path + "data.txt");
                if (!f.exists()) {
                    f.createNewFile();
                }
                try (FileWriter fw = new FileWriter(path + "data.txt", true)) {
                    fw.write("\r\n#记录时间: " + new SimpleDateFormat("yyyy-MM-dd  HH:mm:ss").format(new Date()) + "\r\n");
                    fw.flush();
                    response.getWriter().print("开始记录，文件保存目录为 " + path);
                } catch (Exception e) {
                    response.getWriter().print("记录失败！");
                }
                break;
            case "save":
                String[] liquid = request.getParameter("liquid").split(" ");
                try (FileWriter fw = new FileWriter(path + "data.txt", true)) {
                    fw.write("液位: " + liquid[0] + " %  " + liquid[1] + " %  " + liquid[2] + " %     "
                            + "时间: " + new SimpleDateFormat("HH:mm:ss").format(new Date()) + "\r\n");
                    fw.flush();
                } catch (Exception e) {
                }
                break;
            case "disp":
                JFrame jf = new JFrame("液位变化曲线图");
                jf.setSize(300, 200);
                DisplayData staticChart = new DisplayData(path, "Liquid Height", "t (s)", "height (%)", "tank1", "tank2", "tank3");
                jf.getContentPane().add(staticChart.createChartPanel(0, 100));
                jf.pack();
                jf.setLocationRelativeTo(null);
                jf.setVisible(true);
                jf.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
                break;
            default:
                break;
        }
    }

}
